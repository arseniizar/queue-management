import { IsNotEmpty } from "class-validator";

export class QueueDeleteDto {
  @IsNotEmpty()
  queueId: string;
}
