import {
    IsNotEmpty,
    IsString,
    IsOptional,
    ValidateNested,
    IsISO8601,
    IsEmail,
    IsIn,
    IsPhoneNumber
} from "class-validator";
import {Type} from "class-transformer";
import {DayType, ScheduleObj} from "@/schemas/timetable.schema";

export class ClientAppointment {
    @IsNotEmpty()
    @IsString()
    place: string;

    @IsNotEmpty()
    @IsISO8601()
    time: string;
}

export class AddClientToQueueDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    queueId: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => ClientAppointment)
    appointment: ClientAppointment;
}


export class AddPlaceToQueue {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    queueId: string;
}


export class AddTimeDto {
    @IsNotEmpty()
    @IsString()
    @IsISO8601({}, {message: 'Invalid time format. Must be an ISO string.'})
    time: string;
}


export class AppointDto {
    @IsNotEmpty()
    @IsString()
    clientUsername: string;

    @IsNotEmpty()
    @IsString()
    placeId: string;

    @IsNotEmpty()
    @IsISO8601()
    time: string;
}

export class AuthDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;
}


export class CreateTimetableDto {
    @IsNotEmpty()
    @IsString()
    placeId: string;

    @IsNotEmpty()
    @ValidateNested({each: true})
    @Type(() => ScheduleObj)
    schedule: ScheduleObj[];
}


export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    @IsPhoneNumber()
    phone: string;

    @IsNotEmpty()
    username: string;

    cancelled: boolean;

    approved: boolean;

    processed: boolean;

    key: string;

    refreshToken: string;

    roles: string;
}


export class FindScheduleDto {
    @IsNotEmpty()
    @IsString()
    placeId: string;

    @IsNotEmpty()
    @IsIn(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"])
    day: DayType;
}


export class ForgotPasswordDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
}


export class UserDeleteDto {
    @IsNotEmpty()
    queueId: string;

    @IsNotEmpty()
    userId: string;
}


export class RolesDto {
    @IsNotEmpty()
    name: string;
}


export class ResetTokenDto {
    @IsNotEmpty()
    value: string;

    @IsNotEmpty()
    expTime: Date;

    @IsNotEmpty()
    userId: string;
}


export class ResetPasswordDto {
    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    token: string;
}


export class RemoveTimeDto {
    @IsNotEmpty()
    @IsString()
    @IsISO8601({}, {message: 'Invalid time format. Must be an ISO string.'})
    time: string;
}


export class QueuePlaceDto extends CreateUserDto {
    @IsNotEmpty()
    queueId: string;
}


export class QueueDeleteDto {
    @IsNotEmpty()
    queueId: string;
}


export class QueueDto {
    @IsNotEmpty()
    name: string;

    places: [];

    usersQueue: [];
}


export class SubmitScheduleDto {
    @IsNotEmpty()
    @IsString()
    placeId: string;

    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ScheduleObj)
    schedule: ScheduleObj[];
}
