import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from "@nestjs/common";

@Injectable()
export class ScheduleValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value.time) {
            throw new BadRequestException("The 'time' field is required.");
        }

        const date = new Date(value.time);

        if (isNaN(date.getTime())) {
            throw new BadRequestException("Invalid time format. Please provide a valid ISO 8601 date string.");
        }

        return {...value, time: date.toISOString()};
    }
}
