import {BadRequestException, Injectable, InternalServerErrorException, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {AppointDto} from "src/dto/appoint.dto";
import {CreateTimetableDto} from "src/dto/create-timetable.dto";
import {FindScheduleDto} from "src/dto/find-schedule.dto";
import {Timetable, TimetableDocument} from "src/schemas/timetable.schema";
import {UsersService} from "src/users/users.service";
import {SchedulerService} from "@/schedule/scheduler.service";
import {getFormattedSchedule} from "@/constants";

@Injectable()
export class TimetablesService {
    constructor(
        @InjectModel(Timetable.name)
        private timetableModel: Model<TimetableDocument>,
        private usersService: UsersService,
        private schedulerService: SchedulerService,
    ) {
    }

    async findById(id: string) {
        return this.timetableModel.findById(id);
    }

    /**
     * Finds a timetable by the associated placeId.
     * @returns The timetable document if found, otherwise throws an error.
     * @param criteria
     */
    async findOne(criteria: { placeId: string }): Promise<TimetableDocument | null> {
        const timetable = await this.timetableModel.findOne(criteria).exec();
        return timetable;
    }

    /**
     * Delete a timetable based on placeId
     * @param placeId - The ID of the place whose timetable should be deleted
     */
    async delete(placeId: string): Promise<void> {
        const result = await this.timetableModel.deleteOne({placeId}).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Timetable for placeId ${placeId} not found.`);
        }
    }

    async create(createTimetableDto: CreateTimetableDto) {
        const isPlaceIdExists = await this.timetableModel
            .exists({placeId: createTimetableDto.placeId})
            .exec();

        if (isPlaceIdExists) {
            throw new BadRequestException("Timetable for this place already exists");
        }

        const createdTimetable = new this.timetableModel({
            ...createTimetableDto,
        });

        return createdTimetable.save();
    }

    async findSchedule(findScheduleDto: FindScheduleDto) {
        const timetable = await this.timetableModel.findOne({
            placeId: findScheduleDto.placeId,
        });
        if (!timetable) {
            throw new BadRequestException("This timetable is not exist");
        }
        const busyTime = timetable.appointments.filter((appointment) =>
            timetable.schedule.includes(appointment.time)
        );
        if (busyTime) {
            const freeTime = timetable.schedule.filter((time, index) => {
                return timetable.schedule.indexOf(time) === index;
            });
            if (!freeTime) {
                return "this place does not have free time";
            }
            return freeTime;
        } else if (!busyTime) {
            return timetable.schedule;
        }
    }


    async getAppointmentsByClientId(clientId: string) {
        const timetables = await this.timetableModel.find().exec();

        const clientAppointments = timetables
            .flatMap((timetable) => timetable.appointments)
            .filter((appointment) => appointment.clientId === clientId);

        return clientAppointments;
    }

    async appoint(appointDto: AppointDto) {
        const timetable = await this.timetableModel.findOne({
            placeId: appointDto.placeId,
        });
        const client = await this.usersService.findOne(appointDto.clientUsername);

        if (!timetable || !client) {
            throw new BadRequestException("Client or timetable does not exist");
        }

        const appointments = timetable.appointments;
        const newAppointment = {
            time: appointDto.time,
            clientId: client._id.toString(),
        };

        const isAppointmentExist = appointments.filter(
            (appointment) => appointment.time === newAppointment.time
        );
        if (isAppointmentExist.length) {
            throw new BadRequestException("Appointment already exists");
        }

        const freeTime = await this.findSchedule({placeId: appointDto.placeId});
        const isTimeValid = timetable.schedule.filter(
            (time) => time === appointDto.time
        );
        if (isTimeValid.length === 0) {
            throw new BadRequestException("This time is invalid");
        }

        appointments.push(newAppointment);

        await this.timetableModel.findByIdAndUpdate(timetable._id, {
            appointments: [...appointments],
        });

        // Schedule the email notification
        const appointmentDate = new Date(appointDto.time); // Assuming appointDto.time is a valid date string
        if (appointmentDate) {
            try {
                await this.schedulerService.scheduleAppointmentNotification(
                    client.email,
                    appointmentDate
                );
            } catch (error) {
                throw new InternalServerErrorException("Failed to schedule email notification");
            }
        }

        return {message: "Appointment created and email scheduled"};
    }


    async getAvailableTimes(placeId: string): Promise<string[]> {
        const timetable = await this.timetableModel.findOne({placeId});
        if (!timetable) {
            throw new BadRequestException("This timetable does not exist.");
        }

        const busyTimes = timetable.appointments.map((appointment) => appointment.time);
        const availableTimes = timetable.schedule.filter((time) => !busyTimes.includes(time));

        return availableTimes;
    }

    /**
     * Adds a new time slot to the timetable's schedule.
     * @param userId - The ID of the user (for authorization or auditing purposes).
     * @param time - The time slot to add.
     */
    async addTime(userId: string, time: string): Promise<TimetableDocument> {
        const timetable = await this.timetableModel.findOne({userId});

        if (!timetable) {
            throw new NotFoundException('Timetable not found for the user.');
        }

        if (timetable.schedule.includes(time)) {
            throw new BadRequestException('This time slot already exists in the schedule.');
        }

        timetable.schedule.push(time);

        await timetable.save();

        return timetable;
    }

    /**
     * Removes a time slot from the timetable's schedule.
     * @param userId - The ID of the user (for authorization or auditing purposes).
     * @param time - The time slot to remove.
     */
    async removeTime(userId: string, time: string): Promise<TimetableDocument> {
        const timetable = await this.timetableModel.findOne({userId});

        if (!timetable) {
            throw new NotFoundException('Timetable not found for the user.');
        }

        const timeIndex = timetable.schedule.indexOf(time);

        if (timeIndex === -1) {
            throw new BadRequestException('This time slot does not exist in the schedule.');
        }

        timetable.schedule.splice(timeIndex, 1);

        await timetable.save();

        return timetable;
    }

    /**
     * Retrieves the timetable schedule for the specified user.
     * @param userId - The ID of the user.
     */
    async getSchedule(userId: string): Promise<string[]> {
        const timetable = await this.timetableModel.findOne({userId});

        if (!timetable) {
            throw new NotFoundException('Timetable not found for the user.');
        }

        return timetable.schedule;
    }
}
