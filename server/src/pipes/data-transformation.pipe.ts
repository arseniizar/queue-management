import {ArgumentMetadata, Injectable, PipeTransform} from "@nestjs/common";

@Injectable()
export class DataTransformationPipe implements PipeTransform {
    transform(value: Record<string, any>, metadata: ArgumentMetadata) {
        if (typeof value !== "object" || value === null) {
            return value;
        }

        return Object.entries(value).reduce((acc, [key, val]) => {
            acc[key] = typeof val === "string" ? val.toLowerCase() : val;
            return acc;
        }, {} as Record<string, any>);
    }
}
