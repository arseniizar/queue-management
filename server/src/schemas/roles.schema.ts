import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type RolesDocument = HydratedDocument<Roles>;

@Schema()
export class Roles {
  @Prop()
  name: string;

  @Prop()
  permissions: string[];
}

export const RoleSchema = SchemaFactory.createForClass(Roles);
