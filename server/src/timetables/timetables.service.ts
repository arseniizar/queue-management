import {BadRequestException, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {AppointDto} from "src/dto/appoint.dto";
import {CreateTimetableDto} from "src/dto/create-timetable.dto";
import {FindScheduleDto} from "src/dto/find-schedule.dto";
import {Timetable, TimetableDocument} from "src/schemas/timetable.schema";
import {UsersService} from "src/users/users.service";

@Injectable()
export class TimetablesService {
  constructor(
    @InjectModel(Timetable.name)
    private timetableModel: Model<TimetableDocument>,
    private usersService: UsersService
  ) {}

  async findById(id: string) {
    return this.timetableModel.findById(id);
  }

  async create(createTimetableDto: CreateTimetableDto) {
    const isPlaceIdExists = await this.timetableModel
      .exists({ placeId: createTimetableDto.placeId })
      .exec();
    if (isPlaceIdExists) {
      throw new BadRequestException("Timetable for this place already exists");
    }
    const createdTimetable = new this.timetableModel({ ...createTimetableDto });
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

  async appoint(appointDto: AppointDto) {
    const timetable = await this.timetableModel.findOne({
      placeId: appointDto.placeId,
    });
    const client = await this.usersService.findOne(appointDto.clientUsername);
    if (!timetable || !client) {
      throw new BadRequestException("Client or timetable is not exist");
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
    appointments.push(newAppointment);
    const freeTime = await this.findSchedule({ placeId: appointDto.placeId });
    console.log("free time - ", freeTime);
    const isTimeValid = timetable.schedule.filter(
      (time) => time === appointDto.time
    );
    if (isTimeValid.length === 0) {
      throw new BadRequestException("This time is invalid");
    }
    console.log(isTimeValid, isTimeValid.length);
    return this.timetableModel.findByIdAndUpdate(
        timetable._id,
        {appointments: [...appointments]}
    );
  }
}
