import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Param,
    Req,
    UnauthorizedException,
    BadRequestException,
} from "@nestjs/common";
import {Throttle} from "@nestjs/throttler";
import {TimetablesService} from "./timetables.service";
import {DataTransformationPipe} from "@/pipes/data-transformation.pipe";
import {ScheduleValidationPipe} from "src/pipes/schedule-validation.pipe";
import {AccessTokenGuard} from "@/auth/guards/accessToken.guard";
import {RolesGuard} from "@/auth/guards/roles.guard";
import {Roles} from "@/decorators/roles.decorator";
import {Role} from "@/enums/role.enum";
import {defaultSchedule, ThrottleConfig} from "@/constants";
import {DayType, TimetableAppointment} from "@/schemas/timetable.schema";
import {AuthRequest} from "@/auth/auth.controller";
import {AppointDto, CreateTimetableDto, FindScheduleDto, SubmitScheduleDto} from "@/dto";

@Controller("timetables")
@UseGuards(AccessTokenGuard)
export class TimetablesController {
    constructor(private readonly timetablesService: TimetablesService) {
    }

    @Throttle(ThrottleConfig.FIND_SCHEDULE)
    @Post("find-schedule")
    async findSchedule(
        @Body(DataTransformationPipe) findScheduleDto: FindScheduleDto,
    ) {
        return await this.timetablesService.findSchedule(findScheduleDto);
    }

    @Throttle(ThrottleConfig.APPOINT)
    @Post("appoint")
    async appoint(
        @Body(DataTransformationPipe, ScheduleValidationPipe)
        appointDto: AppointDto,
    ) {
        return await this.timetablesService.appoint(appointDto);
    }

    @Throttle(ThrottleConfig.CREATE_TIMETABLE)
    @Roles(Role.Admin)
    @UseGuards(RolesGuard)
    @Post("create")
    async create(
        @Body(DataTransformationPipe) createTimetableDto: CreateTimetableDto,
    ) {
        return await this.timetablesService.create(createTimetableDto);
    }

    @Throttle(ThrottleConfig.CREATE_TIMETABLE)
    @Get("appointments/:clientId")
    async getAppointmentsByClientId(
        @Param("clientId") clientId: string,
    ): Promise<TimetableAppointment[]> {
        return this.timetablesService.getAppointmentsByClientId(clientId);
    }

    @Throttle(ThrottleConfig.CREATE_TIMETABLE)
    @Get("available-times/:placeId/:day")
    async getAvailableTimes(
        @Param("placeId") placeId: string,
        @Param("day") day: string,
    ) {
        return await this.timetablesService.getAvailableTimes(placeId, day);
    }

    @Throttle(ThrottleConfig.CREATE_TIMETABLE)
    @Get("my-schedule")
    async getMySchedule(@Req() req: AuthRequest) {
        if (!req.user || !req.user.userId) {
            throw new UnauthorizedException("User is not authenticated.");
        }

        const schedule = await this.timetablesService.getSchedule(req.user.userId);

        return schedule;
    }

    // @Throttle(ThrottleConfig.CREATE_TIMETABLE)
    // @Post("add-time")
    // async addTime(
    //     @Req() req: AuthRequest,
    //     @Body("day") day: string,
    //     @Body("time") time: string,
    // ) {
    //     if (!req.user || !req.user.userId) {
    //         throw new UnauthorizedException("User is not authenticated.");
    //     }
    //     if (!day || !time) {
    //         throw new BadRequestException("Day and time are required.");
    //     }
    //     return this.timetablesService.addTime(req.user.userId, day as DayType, time);
    // }

    @Throttle(ThrottleConfig.CREATE_TIMETABLE)
    @Post("remove-time")
    async removeTime(
        @Req() req: AuthRequest,
        @Body("day") day: string,
        @Body("time") time: string,
    ) {
        if (!req.user || !req.user.userId) {
            throw new UnauthorizedException("User is not authenticated.");
        }
        if (!day || !time) {
            throw new BadRequestException("Day and time are required.");
        }
        return this.timetablesService.removeTime(req.user.userId, day, time);
    }

    @Throttle(ThrottleConfig.CREATE_TIMETABLE)
    @Roles(Role.Employee)
    @UseGuards(RolesGuard)
    @Post('submit-schedule')
    async submitSchedule(@Body() submitScheduleDto: SubmitScheduleDto) {
        const {placeId, schedule} = submitScheduleDto;

        if (!placeId || !schedule) {
            throw new BadRequestException('Place ID and schedule are required.');
        }

        return await this.timetablesService.addScheduleToTimetable(placeId, schedule);
    }

    @Throttle(ThrottleConfig.CREATE_TIMETABLE)
    @Get("create-personal")
    async createPersonalTimetable(@Req() req: AuthRequest) {
        console.log(req.user);
        if (!req.user || !req.user.userId) {
            throw new UnauthorizedException("User is not authenticated.");
        }

        return this.timetablesService.create({
            placeId: req.user.userId,
            schedule: defaultSchedule,
        });
    }
}
