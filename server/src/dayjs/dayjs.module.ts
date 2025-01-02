import {Module} from '@nestjs/common';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

@Module({
    providers: [
        {
            provide: 'DAYJS',
            useValue: dayjs,
        },
    ],
    exports: ['DAYJS'],
})
export class DayjsModule {
}
