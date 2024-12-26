import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

interface Appointment {
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
  appointments: Appointment[];
}

export const TimeTableSchema = SchemaFactory.createForClass(Timetable);
