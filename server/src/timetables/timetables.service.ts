import {
    BadRequestException, Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {DayType, ScheduleObj, Timetable, TimetableAppointment, TimetableDocument} from "src/schemas/timetable.schema";
import {UsersService} from "src/users/users.service";
import {SchedulerService} from "@/schedule/scheduler.service";
import dayjs from "dayjs";
import {AppointDto, CreateTimetableDto, FindScheduleDto} from "@/dto";

@Injectable()
export class TimetablesService {
    constructor(
        @InjectModel(Timetable.name)
        private timetableModel: Model<TimetableDocument>,
        private usersService: UsersService,
        private schedulerService: SchedulerService,
        @Inject('DAYJS') private readonly mDayjs: typeof dayjs
    ) {
    }

    async findById(id: string): Promise<TimetableDocument> {
        const timetable = await this.timetableModel.findById(id).exec();
        if (!timetable) {
            throw new NotFoundException(`Timetable with ID ${id} not found.`);
        }
        return timetable;
    }

    async findOne(criteria: { placeId: string }): Promise<TimetableDocument | null> {
        return this.timetableModel.findOne(criteria).exec();
    }

    async delete(placeId: string): Promise<void> {
        const result = await this.timetableModel.deleteOne({placeId}).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Timetable for placeId ${placeId} not found.`);
        }
    }

    async create(createTimetableDto: CreateTimetableDto): Promise<TimetableDocument> {
        const exists = await this.timetableModel.exists({placeId: createTimetableDto.placeId}).exec();
        if (exists) {
            throw new BadRequestException("Timetable for this place already exists.");
        }

        const newTimetable = new this.timetableModel(createTimetableDto);

        try {
            return await newTimetable.save();
        } catch (error) {
            console.error("Failed to save timetable:", error);
            throw new BadRequestException("Failed to create timetable. Please try again.");
        }
    }

    async findSchedule(findScheduleDto: FindScheduleDto): Promise<string[]> {
        const timetable = await this.timetableModel.findOne({
            placeId: findScheduleDto.placeId,
        }).exec();

        if (!timetable) {
            throw new NotFoundException("Timetable not found.");
        }

        const daySchedule = timetable.schedule.find((s) => s.day === findScheduleDto.day);
        if (!daySchedule) {
            throw new NotFoundException(`No schedule found for ${findScheduleDto.day}.`);
        }

        const busyTimes = timetable.appointments
            .filter((appointment) => appointment.time.startsWith(findScheduleDto.day))
            .map((appointment) => appointment.time.split("T")[1]);

        const availableTimes = daySchedule.timeStamps.filter((time) => !busyTimes.includes(time));
        return availableTimes.length ? availableTimes : ["No available times."];
    }

    async addScheduleToTimetable(placeId: string, schedule: ScheduleObj[]): Promise<TimetableDocument> {
        const timetable = await this.timetableModel.findOne({placeId}).exec();

        if (!timetable) {
            throw new NotFoundException(`Timetable for placeId ${placeId} not found.`);
        }

        timetable.schedule = schedule;

        return await timetable.save();
    }

    async getAppointmentsByClientId(clientId: string): Promise<TimetableAppointment[]> {
        const timetables = await this.timetableModel.find().exec();
        return timetables
            .flatMap((timetable) => timetable.appointments)
            .filter((appointment) => appointment.clientId === clientId);
    }

    async appoint(appointDto: AppointDto): Promise<{ message: string }> {
        const timetable = await this.timetableModel.findOne({
            placeId: appointDto.placeId,
        }).exec();
        const client = await this.usersService.findOne(appointDto.clientUsername);

        if (!timetable || !client) {
            throw new BadRequestException("Client or timetable does not exist.");
        }

        const appointmentTime = this.mDayjs(appointDto.time);
        const day = appointmentTime.format("dddd").toLowerCase() as DayType;

        const daySchedule = timetable.schedule.find((s) => s.day === day);
        if (!daySchedule) {
            throw new BadRequestException(`No schedule found for ${day}.`);
        }

        const isTimeValid = daySchedule.timeStamps.some((timestamp) => {
            const scheduleTime = this.mDayjs(`${appointmentTime.format("YYYY-MM-DD")}T${timestamp}`, 'YYYY-MM-DDTHH:mm');
            return appointmentTime.isSame(scheduleTime, 'minute');
        });
        if (!isTimeValid) {
            throw new BadRequestException("This time is invalid.");
        }

        const isAppointmentExist = timetable.appointments.some(
            (appointment) => this.mDayjs(appointment.time).isSame(appointmentTime, 'minute'),
        );
        if (isAppointmentExist) {
            throw new BadRequestException("Appointment already exists.");
        }

        const newAppointment = {
            time: appointDto.time,
            clientId: client._id.toString(),
        };

        timetable.appointments.push(newAppointment);
        await timetable.save();

        try {
            await this.schedulerService.scheduleAppointmentNotification(
                client.email,
                appointmentTime.toDate(),
            );
        } catch {
            throw new InternalServerErrorException("Failed to schedule email notification.");
        }

        return { message: "Appointment created and email scheduled." };
    }

    async getAvailableTimes(placeId: string, day: string): Promise<string[]> {
        const timetable = await this.timetableModel.findOne({placeId}).exec();
        if (!timetable) {
            throw new NotFoundException("Timetable not found.");
        }

        const daySchedule = timetable.schedule.find((s) => s.day === day);
        if (!daySchedule) {
            throw new NotFoundException(`No schedule found for ${day}.`);
        }

        const busyTimes = timetable.appointments
            .filter((appointment) => {
                const appointmentDate = new Date(appointment.time).toISOString().split("T")[0];
                const dayDate = new Date().toISOString().split("T")[0];
                return appointmentDate === dayDate;
            })
            .map((appointment) => new Date(appointment.time).toISOString().split("T")[1].slice(0, 5));

        return daySchedule.timeStamps.filter((time) => !busyTimes.includes(time));
    }


    // async addTime(userId: string, day: DayType, time: string): Promise<TimetableDocument> {
    //     const timetable = await this.timetableModel.findOne({userId}).exec();
    //     if (!timetable) {
    //         throw new NotFoundException("Timetable not found.");
    //     }
    //
    //     const daySchedule = timetable.schedule.find((s) => s.day === day);
    //
    //     if (!daySchedule) {
    //         timetable.schedule.push({day, timeStamps: [time]});
    //     } else {
    //         const newTime = this.mDayjs(time, "HH:mm");
    //         if (!newTime.isValid()) {
    //             throw new BadRequestException("Invalid time format. Use HH:mm.");
    //         }
    //
    //         // Check for 90-minute conflicts with existing times
    //         const hasConflict = daySchedule.timeStamps.some((existingTime) => {
    //             const existing = this.mDayjs(existingTime, "HH:mm");
    //             const diff = Math.abs(newTime.diff(existing, "minute"));
    //             return diff < 90;
    //         });
    //
    //         if (hasConflict) {
    //             throw new BadRequestException(
    //                 "Time slot must be at least 90 minutes apart from existing slots."
    //             );
    //         }
    //
    //         // Add the new time and sort the timestamps
    //         daySchedule.timeStamps.push(time);
    //         daySchedule.timeStamps.sort();
    //     }
    //
    //     return timetable.save();
    // }


    async removeTime(userId: string, day: string, time: string): Promise<TimetableDocument> {
        const timetable = await this.timetableModel.findOne({userId}).exec();
        if (!timetable) {
            throw new NotFoundException("Timetable not found.");
        }

        const daySchedule = timetable.schedule.find((s) => s.day === day);
        if (!daySchedule) {
            throw new BadRequestException(`No schedule found for ${day}.`);
        }

        const timeIndex = daySchedule.timeStamps.indexOf(time);
        if (timeIndex === -1) {
            throw new BadRequestException("Time slot does not exist.");
        }

        daySchedule.timeStamps.splice(timeIndex, 1);
        return timetable.save();
    }

    async getSchedule(userId: string): Promise<ScheduleObj[]> {
        const timetable = await this.timetableModel.findOne({placeId: userId}).exec();
        if (!timetable) {
            throw new NotFoundException("Timetable not found.");
        }

        return timetable.schedule;
    }
}
