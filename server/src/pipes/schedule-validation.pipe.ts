import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ScheduleValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.time) {
      const date = new Date("May 8 2023 14:00");
      console.log(date);
    }
    return value;
  }
}
