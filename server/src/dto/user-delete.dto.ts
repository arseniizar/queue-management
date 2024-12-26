import { IsNotEmpty } from "class-validator";

export class UserDeleteDto {
  @IsNotEmpty()
  queueId: string;

  @IsNotEmpty()
  userId: string;
}
