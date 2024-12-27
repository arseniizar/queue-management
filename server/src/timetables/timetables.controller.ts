import {Controller, Post, Body, UseGuards} from "@nestjs/common";
import {Throttle} from "@nestjs/throttler";
import {TimetablesService} from "./timetables.service";
import {DataTransformationPipe} from "@/pipes/data-transformation.pipe";
import {FindScheduleDto} from "src/dto/find-schedule.dto";
import {AppointDto} from "src/dto/appoint.dto";
import {CreateTimetableDto} from "src/dto/create-timetable.dto";
import {ScheduleValidationPipe} from "src/pipes/schedule-validation.pipe";
import {AccessTokenGuard} from "@/auth/guards/accessToken.guard";
import {RolesGuard} from "@/auth/guards/roles.guard";
import {Roles} from "@/decorators/roles.decorator";
import {Role} from "@/enums/role.enum";
import {ThrottleConfig} from "@/constants";

@Controller("timetables")
@UseGuards(AccessTokenGuard)
export class TimetablesController {
    constructor(private readonly timetablesService: TimetablesService) {
    }

    @Throttle(ThrottleConfig.FIND_SCHEDULE)
    @Post("find-schedule")
    async findSchedule(
        @Body(DataTransformationPipe) findScheduleDto: FindScheduleDto
    ) {
        return await this.timetablesService.findSchedule(findScheduleDto);
    }

    @Throttle(ThrottleConfig.APPOINT)
    @Roles(Role.User)
    @UseGuards(RolesGuard)
    @Post("appoint")
    async appoint(
        @Body(DataTransformationPipe, ScheduleValidationPipe)
        appointDto: AppointDto
    ) {
        return await this.timetablesService.appoint(appointDto);
    }

    @Throttle(ThrottleConfig.CREATE_TIMETABLE)
    @Roles(Role.Admin)
    @UseGuards(RolesGuard)
    @Post("create")
    async create(
        @Body(DataTransformationPipe) createTimetableDto: CreateTimetableDto
    ) {
        return await this.timetablesService.create(createTimetableDto);
    }
}
