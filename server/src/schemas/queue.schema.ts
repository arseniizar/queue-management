import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId } from "mongoose";

export type QueueDocument = HydratedDocument<Queue>;

@Schema()
export class Queue {
  @Prop()
  places: [];

  @Prop()
  name: string;

  @Prop()
  clients: [];
}

export const QueueSchema = SchemaFactory.createForClass(Queue);
