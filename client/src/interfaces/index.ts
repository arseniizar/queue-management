export interface Appointment {
    place: string;
    time: string;
}

export interface QueueClient {
    appointment: Appointment;
    approved: boolean;
    cancelled: boolean;
    email: string;
    key: string;
    password: string;
    phone: string;
    processed: boolean;
    refreshToken: string;
    roles: string;
    username: string;
    __v: 0;
    _id: string;
}

export interface QueuePlace extends QueueClient {
}

export interface Queue {
    name: string;
    places: QueuePlace[];
    clients: QueueClient[];
    __v: number;
    _id: string;
}

export interface User {
    username: string;
    password: string;
    phone: string;
    email: string;
}

export interface Place extends User {
    roles: string;
    queueId: string;
}

export interface UserLogin {
    username: string;
    password: string;
}

export interface UserDeletion {
    queueId: string;
    userId: string;
}

export interface PlaceAddition {
}
