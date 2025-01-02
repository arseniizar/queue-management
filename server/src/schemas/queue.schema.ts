import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument, ObjectId, Schema as MongooseSchema} from "mongoose";

export type QueueDocument = HydratedDocument<Queue>;

class Appointment {
    @Prop({required: true})
    time: string;

    @Prop({required: true})
    place: string;
}

export class Place {
    @Prop({required: true})
    username: string;

    @Prop({required: true})
    email: string;

    @Prop({required: true})
    phone: string;

    @Prop({required: true})
    userId: string;

    @Prop({required: true})
    queueId: string;

    @Prop({required: true})
    roles: string;

    @Prop({required: true})
    key: string;
}

export class Client {
    @Prop({required: true})
    username: string;

    @Prop({required: true})
    email: string;

    @Prop({required: true})
    phone: string;

    @Prop({required: true})
    userId: string;

    @Prop({required: true})
    queueId: string;

    @Prop({required: true})
    roles: string;

    @Prop({required: false})
    cancelled: boolean;

    @Prop({required: false})
    approved: boolean;

    @Prop({required: false})
    processed: boolean;

    @Prop({required: true})
    key: string;

    @Prop({type: Appointment, required: false})
    appointment?: Appointment;
}

@Schema()
export class Queue {
    @Prop({type: [Place], default: []})
    places: Place[];

    @Prop({required: true})
    name: string;

    @Prop({type: [Client], default: []})
    clients: Client[];
}

export const QueueSchema = SchemaFactory.createForClass(Queue);
