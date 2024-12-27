import {IsISO8601, IsNotEmpty} from "class-validator";

export class AppointDto {
    @IsNotEmpty()
    clientUsername: string;

    @IsNotEmpty()
    placeId: string;

    @IsNotEmpty()
    @IsISO8601()
    time: string;
}
