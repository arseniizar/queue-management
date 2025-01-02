import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";
import {
    IsArray,
    IsIn,
    IsString,
    Matches,
    ValidateNested,
    IsNotEmpty, IsISO8601,
} from "class-validator";
import {Type} from "class-transformer";

export type DayType =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

export class ScheduleObj {
    @IsString()
    @IsIn(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"])
    day: DayType;

    @IsArray()
    @IsNotEmpty({message: "timeStamps cannot be empty"})
    @Matches(/^\d{2}:\d{2}$/, {each: true})
    timeStamps: string[];
}

export class TimetableAppointment {
    @IsISO8601()
    @IsNotEmpty({message: "time cannot be empty"})
    time: string;

    @IsString()
    @IsNotEmpty({message: "clientId cannot be empty"})
    clientId: string;
}

export type TimetableDocument = HydratedDocument<Timetable>;

@Schema()
export class Timetable {
    @Prop({required: true, unique: true})
    @IsString()
    @IsNotEmpty({message: "placeId is required"})
    placeId: string;

    @Prop({
        type: [{day: {type: String}, timeStamps: [String]}],
        required: true,
    })
    @ValidateNested({each: true})
    @Type(() => ScheduleObj)
    @IsArray()
    @IsNotEmpty({message: "schedule cannot be empty"})
    schedule: ScheduleObj[];

    @Prop({
        type: [{time: String, clientId: String}],
        required: false,
    })
    @ValidateNested({each: true})
    @Type(() => TimetableAppointment)
    @IsArray()
    appointments: TimetableAppointment[];
}

export const TimetableSchema = SchemaFactory.createForClass(Timetable);
