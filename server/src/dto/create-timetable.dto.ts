import { IsNotEmpty } from "class-validator";
import { MaxLength, MinLength } from "class-validator";

export class CreateTimetableDto {
  @IsNotEmpty()
  placeId: string;

  @IsNotEmpty()
  @MaxLength(5)
  @MinLength(3)
  schedule: string[];
}
