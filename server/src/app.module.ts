import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ConfigModule} from '@nestjs/config';
import {ThrottlerModule} from '@nestjs/throttler';
import {BullModule} from '@nestjs/bull';

import {AppController} from './app.controller';
import {AppService} from './app.service';

import {UsersModule} from './users/users.module';
import {AuthModule} from './auth/auth.module';
import {MailModule} from './mail/mail.module';
import {QueueModule} from './queues/queues.module';
import {RolesModule} from './roles/roles.module';
import {TimetablesModule} from './timetables/timetables.module';

import {DatabaseService} from './database/database.service';
import {ScheduleModule} from "@nestjs/schedule";
import {SchedulerModule} from "@/schedule/scheduler.module";
import { DayjsModule } from './dayjs/dayjs.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '.env.local'],
        }),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    name: 'default',
                    limit: 10,
                    ttl: 60,
                    blockDuration: 300,
                },
            ],
        }),
        MongooseModule.forRoot(process.env.MONGO_URI || ''),
        BullModule.forRoot({
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
            },
        }),
        UsersModule,
        AuthModule,
        MailModule,
        QueueModule,
        RolesModule,
        ScheduleModule.forRoot(),
        SchedulerModule,
        TimetablesModule,
        DayjsModule,
    ],
    controllers: [AppController],
    providers: [AppService, DatabaseService],
})
export class AppModule {
}
