import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export interface TimetableAppointment {
  time: string;
  clientId: string;
}

export type TimetableDocument = HydratedDocument<Timetable>;

@Schema()
export class Timetable {
  @Prop()
  placeId: string;

  @Prop()
  schedule: string[];

  @Prop({
    time: String,
    clientId: String,
  })
  appointments: TimetableAppointment[];
}

export const TimeTableSchema = SchemaFactory.createForClass(Timetable);
