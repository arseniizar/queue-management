import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ResetTokenDocument = HydratedDocument<ResetToken>;

@Schema()
export class ResetToken {
  @Prop()
  value: string;

  @Prop()
  expTime: Date;

  @Prop()
  userId: string;
}

export const ResetTokenSchema = SchemaFactory.createForClass(ResetToken);
