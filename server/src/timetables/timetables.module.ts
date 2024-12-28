import {forwardRef, Module} from "@nestjs/common";
import {TimetablesController} from "./timetables.controller";
import {TimetablesService} from "./timetables.service";
import {MongooseModule} from "@nestjs/mongoose";
import {Timetable, TimeTableSchema} from "src/schemas/timetable.schema";
import {UsersModule} from "src/users/users.module";
import {SchedulerModule} from "@/schedule/scheduler.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Timetable.name, schema: TimeTableSchema},
        ]),
        forwardRef(() => UsersModule),
        SchedulerModule
    ],
    controllers: [TimetablesController],
    providers: [TimetablesService],
    exports: [TimetablesService],
})
export class TimetablesModule {
}
