import { IsNotEmpty } from "class-validator";

export class QueueDto {
  @IsNotEmpty()
  name: string;

  places: [];

  usersQueue: [];
}
