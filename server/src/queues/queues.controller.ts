import {Body, Controller, Get, Param, Patch, Post, UseGuards,} from "@nestjs/common";
import {Throttle} from "@nestjs/throttler";
import {DataTransformationPipe} from "@/pipes/data-transformation.pipe";
import {QueueService} from "./queues.service";
import {AccessTokenGuard} from "@/auth/guards/accessToken.guard";
import {RolesGuard} from "@/auth/guards/roles.guard";
import {Roles} from "@/decorators/roles.decorator";
import {Role} from "@/enums/role.enum";
import {ThrottleConfig} from "@/constants";
import {User} from "@/schemas/user.schema";
import {AddClientToQueueDto, AddPlaceToQueue, QueueDeleteDto, QueueDto, QueuePlaceDto, UserDeleteDto} from "@/dto";

@Controller("queues")
@UseGuards(AccessTokenGuard)
export class QueueController {
    constructor(private readonly queueService: QueueService) {
    }

    @Throttle(ThrottleConfig.ADD_CLIENT)
    @Post("add-client")
    async addClientToQueue(
        @Body(DataTransformationPipe) addClientToQueueDto: AddClientToQueueDto
    ) {
        await this.queueService.addClientToQueue(addClientToQueueDto);
    }

    @Throttle(ThrottleConfig.ADD_PLACE)
    @Post("add-place")
    async addPlaceToQueue(
        @Body(DataTransformationPipe) addPlaceToQueueDto: AddPlaceToQueue
    ) {
        await this.queueService.addPlaceToQueue(addPlaceToQueueDto);
    }

    @Throttle(ThrottleConfig.CREATE_QUEUE)
    @Roles(Role.Admin) // Only admin can create a queue
    @UseGuards(RolesGuard)
    @Post("create-queue")
    async createQueue(@Body(DataTransformationPipe) queueDto: QueueDto) {
        return this.queueService.createQueue(queueDto);
    }

    @Throttle(ThrottleConfig.CREATE_PLACE)
    @Roles(Role.Admin) // Only admin can create a place
    @UseGuards(RolesGuard)
    @Post("create-place")
    async createPlace(@Body(DataTransformationPipe) queuePlaceDto: QueuePlaceDto) {
        return this.queueService.createPlace(queuePlaceDto);
    }

    @Throttle(ThrottleConfig.GET_QUEUES)
    @Get("get-queues")
    async getQueues() {
        return this.queueService.getAllQueues();
    }

    @Throttle(ThrottleConfig.FIND_QUEUE)
    @Get(":id")
    async findById(@Param("id") id: string) {
        return await this.queueService.findById(id);
    }

    @Throttle(ThrottleConfig.DELETE_PLACE)
    @Roles(Role.Admin)
    @UseGuards(RolesGuard)
    @Patch("delete-place")
    async removePlace(@Body(DataTransformationPipe) userDeleteDto: UserDeleteDto) {
        return this.queueService.deletePlace(userDeleteDto);
    }

    @Throttle(ThrottleConfig.DELETE_CLIENT)
    @Roles(Role.Admin, Role.Employee)
    @UseGuards(RolesGuard)
    @Patch("delete-client")
    async removeClient(@Body(DataTransformationPipe) userDeleteDto: UserDeleteDto) {
        return this.queueService.deleteClient(userDeleteDto);
    }

    @Throttle(ThrottleConfig.DELETE_QUEUE)
    @Roles(Role.Admin)
    @UseGuards(RolesGuard)
    @Patch("delete-queue")
    async removeQueue(@Body(DataTransformationPipe) queueDeleteDto: QueueDeleteDto) {
        return this.queueService.deleteQueue(queueDeleteDto.queueId);
    }


    @Throttle(ThrottleConfig.APPROVE_CLIENT)
    @Patch('approve/:clientId/:queueId')
    @Roles(Role.Admin)
    @UseGuards(RolesGuard)
    async approveClient(
        @Param('clientId') clientId: string,
        @Param('queueId') queueId: string,
    ): Promise<User> {
        return this.queueService.approveClient(clientId, queueId);
    }

    @Throttle(ThrottleConfig.CANCEL_CLIENT)
    @Patch('cancel/:clientId/:queueId')
    @Roles(Role.Admin)
    @UseGuards(RolesGuard)
    async cancelClient(
        @Param('clientId') clientId: string,
        @Param('queueId') queueId: string,
    ): Promise<User> {
        return this.queueService.cancelClient(clientId, queueId);
    }
}
