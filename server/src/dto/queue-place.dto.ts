import { IsNotEmpty } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

export class QueuePlaceDto extends CreateUserDto {
  @IsNotEmpty()
  queueId: string;
}
