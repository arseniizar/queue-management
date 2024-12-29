import {IsNotEmpty, IsString, IsISO8601} from 'class-validator';

export class RemoveTimeDto {
    @IsNotEmpty()
    @IsString()
    @IsISO8601({}, {message: 'Invalid time format. Must be an ISO string.'})
    time: string;
}
