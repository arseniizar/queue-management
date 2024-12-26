import { IsNotEmpty } from "class-validator";

export class AddPlaceToQueue {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  queueId: string;
}
