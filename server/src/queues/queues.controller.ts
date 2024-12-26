import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from "@nestjs/common";
import { AddClientToQueueDto } from "src/dto/add-client-to-queue.dto";
import { QueuePlaceDto } from "src/dto/queue-place.dto";
import { QueueDto } from "src/dto/queue.dto";
import { DataValidationPipe } from "src/pipes/data-transformation.pipe";
import { QueueService } from "./queues.service";
import { UserDeleteDto } from "src/dto/user-delete.dto";
import { QueueDeleteDto } from "src/dto/queue-delete.dto";
import { AddPlaceToQueue } from "src/dto/add-place-to-queue.dto";

@Controller("queues")
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post("add-client")
  async addClientToQueue(
    @Body(DataValidationPipe) addClientToQueueDto: AddClientToQueueDto
  ) {
    await this.queueService.addClientToQueue(addClientToQueueDto);
  }

  @Post("add-place")
  async addPlaceToQueue(
    @Body(DataValidationPipe) addPlaceToQueueDto: AddPlaceToQueue
  ) {
    await this.queueService.addPlaceToQueue(addPlaceToQueueDto);
  }

  @Post("create-queue")
  async createQueue(@Body(DataValidationPipe) queueDto: QueueDto) {
    return this.queueService.createQueue(queueDto);
  }

  @Post("create-place")
  async createPlace(@Body(DataValidationPipe) queuePlaceDto: QueuePlaceDto) {
    return this.queueService.createPlace(queuePlaceDto);
  }

  @Get("get-queues")
  async getQueues() {
    return this.queueService.getAllQueues();
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    const findedQueue = await this.queueService.findById(id);
    return findedQueue;
  }

  @Patch("delete-place")
  async removePlace(@Body(DataValidationPipe) userDeleteDto: UserDeleteDto) {
    return this.queueService.deletePlace(userDeleteDto);
  }

  @Patch("delete-client")
  async removeClient(@Body(DataValidationPipe) userDeleteDto: UserDeleteDto) {
    return this.queueService.deleteClient(userDeleteDto);
  }

  @Patch("delete-queue")
  async removeQueue(@Body(DataValidationPipe) queueDeleteDto: QueueDeleteDto) {
    return this.queueService.deleteQueue(queueDeleteDto.queueId);
  }
}
