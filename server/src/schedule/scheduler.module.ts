import {Module} from '@nestjs/common';
import {ScheduleModule} from '@nestjs/schedule';
import {MailModule} from "@/mail/mail.module";
import {SchedulerService} from "@/schedule/scheduler.service";
import {BullModule} from "@nestjs/bull";

@Module({
    imports: [ScheduleModule.forRoot(), MailModule,
        BullModule.registerQueue({
            name: 'email',
        }),],
    providers: [SchedulerService],
    exports: [SchedulerService],
})
export class SchedulerModule {
}
