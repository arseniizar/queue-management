import {ArgumentMetadata, Injectable, PipeTransform} from "@nestjs/common";

@Injectable()
export class DataTransformationPipe implements PipeTransform {
    transform(value: Record<string, any>, metadata: ArgumentMetadata): any {
        if (typeof value !== "object" || value === null) {
            return value;
        }

        return this.deepTransform(value);
    }

    private deepTransform(obj: Record<string, any>): Record<string, any> {
        return Object.entries(obj).reduce((acc, [key, val]) => {
            acc[key] = this.applyTransformation(val);
            return acc;
        }, {} as Record<string, any>);
    }

    private applyTransformation(value: any): any {
        if (typeof value === "string" && !this.isISODate(value)) {
            return value.toLowerCase();
        } else if (Array.isArray(value)) {
            return value.map((item) => this.applyTransformation(item));
        } else if (typeof value === "object" && value !== null) {
            return this.deepTransform(value);
        }
        return value;
    }

    private isISODate(value: string): boolean {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
        return isoDateRegex.test(value);
    }
}
