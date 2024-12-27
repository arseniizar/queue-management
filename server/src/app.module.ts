import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ConfigModule} from '@nestjs/config';
import {ScheduleModule} from '@nestjs/schedule';
import {ThrottlerModule} from '@nestjs/throttler';

import {AppController} from './app.controller';
import {AppService} from './app.service';

import {UsersModule} from './users/users.module';
import {AuthModule} from './auth/auth.module';
import {MailModule} from './mail/mail.module';
import {QueueModule} from './queues/queues.module';
import {RolesModule} from './roles/roles.module';
import {TimetablesModule} from './timetables/timetables.module';

import {DatabaseService} from './database/database.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '.env.local'],
        }),
        ScheduleModule.forRoot(),
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
        UsersModule,
        AuthModule,
        MailModule,
        QueueModule,
        RolesModule,
        TimetablesModule,
    ],
    controllers: [AppController],
    providers: [AppService, DatabaseService],
})
export class AppModule {
}
