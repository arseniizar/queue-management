import { IsNotEmpty } from "class-validator";
import { ObjectId } from "mongoose";

export class RolesDto {
  @IsNotEmpty()
  name: string;
}
