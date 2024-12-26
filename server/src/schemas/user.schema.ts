import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

interface Appointment {
  place: string;
  time: Date;
}

@Schema()
export class User {
  @Prop()
  email: string;

  @Prop()
  username: string;

  @Prop()
  password: string;

  @Prop()
  phone: string;

  @Prop()
  refreshToken: string;

  @Prop()
  roles: string;

  @Prop()
  cancelled: boolean;

  @Prop()
  approved: boolean;

  @Prop()
  processed: boolean;

  @Prop()
  key: string;

  @Prop({
    type: {
      place: String,
      time: Date,
    },
  })
  appointment: Appointment;
}

export const UserSchema = SchemaFactory.createForClass(User);
