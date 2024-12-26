import { IsNotEmpty } from "class-validator";

export class AppointDto {
  @IsNotEmpty()
  clientUsername: string;

  @IsNotEmpty()
  placeId: string;

  @IsNotEmpty()
  time: string;
}
