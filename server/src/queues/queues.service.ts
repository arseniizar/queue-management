import {ForbiddenException, HttpException, HttpStatus, Injectable,} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {AuthService} from 'src/auth/auth.service';
import {AddClientToQueueDto} from 'src/dto/add-client-to-queue.dto';
import {AddPlaceToQueue} from 'src/dto/add-place-to-queue.dto';
import {QueuePlaceDto} from 'src/dto/queue-place.dto';
import {QueueDto} from 'src/dto/queue.dto';
import {UserDeleteDto} from 'src/dto/user-delete.dto';
import {RolesService} from 'src/roles/roles.service';
import {Queue, QueueDocument} from 'src/schemas/queue.schema';
import {UsersService} from 'src/users/users.service';
import {v4 as uuid} from 'uuid';

interface Place {
    username: string;
    email: string;
    phone: string;
    userId: string;
    queueId: string;
    roles: string;
    key: string;
}

interface Appointment {
    place: string;
    time: Date;
}

interface Client extends Place {
    cancelled: boolean;
    approved: boolean;
    processed: boolean;
    appointment: Appointment | null;
}

@Injectable()
export class QueueService {
    constructor(
        @InjectModel(Queue.name) private readonly queueModel: Model<QueueDocument>,
        private readonly userService: UsersService,
        private readonly authService: AuthService,
        private readonly rolesService: RolesService,
    ) {
    }

    async addClientToQueue(addClientToQueueDto: AddClientToQueueDto) {
        const user = await this.userService.findOne(addClientToQueueDto.username);
        const queue = await this.queueModel.findById(addClientToQueueDto.queueId).exec();

        if (!user || !queue) {
            throw new ForbiddenException("Queue or client doesn't exist.");
        }

        // Guard clause to ensure appointment is not null/undefined
        if (!addClientToQueueDto.appointment) {
            throw new HttpException('Appointment details are required.', HttpStatus.BAD_REQUEST);
        }

        const client: Client = {
            username: user.username,
            email: user.email,
            phone: user.phone,
            userId: user._id.toString(),
            queueId: queue._id.toString(),
            roles: user.roles,
            cancelled: user.cancelled,
            approved: user.approved,
            processed: user.processed,
            key: user.key,
            appointment: {
                time: addClientToQueueDto.appointment.time,
                place: addClientToQueueDto.appointment.place,
            },
        };

        const clients = queue.clients as Client[];
        this.isClientOrPlaceExists<Client>(
            clients,
            client,
            'This user already exists in this queue',
        );

        clients.push(client);
        const updatedQueue = await this.queueModel.findByIdAndUpdate(
            queue._id,
            {clients},
            {new: true},
        );
        return updatedQueue;
    }


    async addPlaceToQueue(addPlaceToQueue: AddPlaceToQueue) {
        const user = await this.userService.findOne(addPlaceToQueue.username);
        const queue = await this.queueModel.findById(addPlaceToQueue.queueId).exec();

        if (!user || !queue) {
            throw new ForbiddenException("Queue or place doesn't exist.");
        }

        const userRole = await this.rolesService.findById(user.roles);
        if (userRole?.name !== 'employee') {
            throw new ForbiddenException('This user is not an employee.');
        }

        const place: Place = {
            username: user.username,
            email: user.email,
            phone: user.phone,
            userId: user._id.toString(),
            queueId: queue._id.toString(),
            roles: user.roles,
            key: user.key,
        };

        const places = queue.places as Place[];
        this.isClientOrPlaceExists<Place>(
            places,
            place,
            'This user already exists in this queue',
        );

        places.push(place);
        const updatedQueue = await this.queueModel.findByIdAndUpdate(
            queue._id,
            {places},
            {new: true},
        );
        return updatedQueue;
    }

    async createQueue(queueDto: QueueDto): Promise<QueueDocument> {
        const isQueueExists = await this.queueModel.exists({name: queueDto.name}).exec();
        if (isQueueExists) {
            throw new HttpException('Queue with this name already exists', HttpStatus.BAD_REQUEST);
        }
        const createdQueue = new this.queueModel(queueDto);
        return createdQueue.save();
    }

    async createPlace(queuePlaceDto: QueuePlaceDto) {
        const queue = await this.queueModel.findById(queuePlaceDto.queueId).exec();
        if (!queue) {
            throw new HttpException("Queue with this ID doesn't exist", HttpStatus.BAD_REQUEST);
        }

        await this.authService.signUp({
            username: queuePlaceDto.username,
            email: queuePlaceDto.email,
            phone: queuePlaceDto.phone,
            roles: queuePlaceDto.roles,
            password: queuePlaceDto.password,
            refreshToken: '',
            cancelled: false,
            approved: false,
            processed: false,
            key: uuid(),
        });

        const employee = await this.authService.employ(queuePlaceDto.username);

        if (!employee) {
            throw new HttpException(
                'Failed to create an employee account',
                HttpStatus.BAD_REQUEST,
            );
        }

        const place: Place = {
            username: employee.username,
            email: employee.email,
            phone: employee.phone,
            queueId: queue._id.toString(),
            userId: employee._id.toString(),
            roles: employee.roles,
            key: employee.key,
        };

        const places = queue.places as Place[];
        this.isClientOrPlaceExists<Place>(places, place, 'This place already exists');
        places.push(place);

        return await this.queueModel
            .findByIdAndUpdate(queue._id, {places}, {new: true})
            .exec();
    }


    isClientOrPlaceExists<T extends { email: string; phone: string; username: string }>(
        array: T[],
        object: T,
        message: string,
    ) {
        const exists = array.some(
            (item) =>
                item.email === object.email ||
                item.phone === object.phone ||
                item.username === object.username,
        );
        if (exists) {
            throw new HttpException(message, HttpStatus.BAD_REQUEST);
        }
    }

    async getAllQueues() {
        return this.queueModel.find().exec();
    }

    async findById(id: string): Promise<QueueDocument | null> {
        return this.queueModel.findById(id).exec();
    }

    async deleteQueue(id: string) {
        return this.queueModel.findByIdAndDelete(id).exec();
    }

    async deletePlace(userDeleteDto: UserDeleteDto) {
        const queue = await this.queueModel.findById(userDeleteDto.queueId).exec();
        if (!queue) {
            throw new ForbiddenException("Queue doesn't exist.");
        }

        const places = queue.places as Place[];
        const index = places.findIndex((p) => p.userId === userDeleteDto.userId);
        if (index === -1) {
            throw new ForbiddenException('Place does not exist.');
        }

        places.splice(index, 1);
        const updatedQueue = await this.queueModel.findByIdAndUpdate(
            queue._id,
            {places},
            {new: true},
        );
        return updatedQueue;
    }

    async deleteClient(userDeleteDto: UserDeleteDto) {
        const queue = await this.queueModel.findById(userDeleteDto.queueId).exec();
        if (!queue) {
            throw new ForbiddenException("Queue doesn't exist.");
        }

        const clients = queue.clients as Client[];
        const index = clients.findIndex((c) => c.userId === userDeleteDto.userId);
        if (index === -1) {
            throw new ForbiddenException('Client does not exist.');
        }

        clients.splice(index, 1);
        const updatedQueue = await this.queueModel.findByIdAndUpdate(
            queue._id,
            {clients},
            {new: true},
        );
        return updatedQueue;
    }
}
