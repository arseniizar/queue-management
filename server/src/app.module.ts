import {MongooseModule} from "@nestjs/mongoose";
import {Module} from "@nestjs/common";
import {AppService} from "./app.service";
import {UsersModule} from "./users/users.module";
import {AuthModule} from "./auth/auth.module";
import {AppController} from "./app.controller";
import {ConfigModule} from "@nestjs/config";
import {MailModule} from "./mail/mail.module";
import {QueueModule} from "./queues/queues.module";
import {RolesModule} from "./roles/roles.module";
import {TimetablesModule} from "./timetables/timetables.module";
import {ScheduleModule} from "@nestjs/schedule";

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ScheduleModule.forRoot(),
        MongooseModule,
        MongooseModule.forRoot(process.env.MONGO_URI || ''),
        UsersModule,
        AuthModule,
        MailModule,
        QueueModule,
        RolesModule,
        TimetablesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
