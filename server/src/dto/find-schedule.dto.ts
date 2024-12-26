import { IsNotEmpty } from "class-validator";

export class FindScheduleDto {
  @IsNotEmpty()
  placeId: string;
}
