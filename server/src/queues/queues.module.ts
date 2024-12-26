import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Queue, QueueSchema } from "src/schemas/queue.schema";
import { QueueService } from "./queues.service";
import { QueueController } from "./queues.controller";
import { UsersModule } from "src/users/users.module";
import { RolesModule } from "src/roles/roles.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Queue.name, schema: QueueSchema }]),
    UsersModule,
    RolesModule,
    AuthModule,
  ],
  providers: [QueueService],
  controllers: [QueueController],
})
export class QueueModule {}
