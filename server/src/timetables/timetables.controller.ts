import { Controller, Post, Body } from "@nestjs/common";
import { TimetablesService } from "./timetables.service";
import { DataValidationPipe } from "src/pipes/data-transformation.pipe";
import { FindScheduleDto } from "src/dto/find-schedule.dto";
import { AppointDto } from "src/dto/appoint.dto";
import { CreateTimetableDto } from "src/dto/create-timetable.dto";
import { ScheduleValidationPipe } from "src/pipes/schedule-validation.pipe";

@Controller("timetables")
export class TimetablesController {
  constructor(private readonly timetablesService: TimetablesService) {}

  @Post("find-schedule")
  async findSchedule(
    @Body(DataValidationPipe)
    findScheduleDto: FindScheduleDto
  ) {
    return await this.timetablesService.findSchedule(findScheduleDto);
  }

  @Post("appoint")
  async appoint(
    @Body(DataValidationPipe, ScheduleValidationPipe) appointDto: AppointDto
  ) {
    return await this.timetablesService.appoint(appointDto);
  }

  @Post("create")
  async create(
    @Body(DataValidationPipe) createTimetableDto: CreateTimetableDto
  ) {
    return await this.timetablesService.create(createTimetableDto);
  }
}
