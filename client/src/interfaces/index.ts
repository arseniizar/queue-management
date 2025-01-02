export interface Appointment {
    place: string;
    time: string;
}

export interface QueueEntity {
    username: string;
    email: string;
    phone: string;
    queueId: string;
    roles: string;
    userId: string;
}

export interface QueuePlace extends QueueEntity {
}

export interface QueueClient extends QueueEntity {
    appointment: Appointment;
    approved: boolean;
    cancelled: boolean;
    processed: boolean;
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
    username: string;
    queueId: string;
}

export interface ProfileResponse {
    exp: number;      // Token expiration timestamp (Unix epoch)
    iat: number;      // Token issued at timestamp (Unix epoch)
    sub: string;      // User ID
    username: string; // Username of the user
}

export interface ScheduleResponse {
    schedule: string[];
}

export interface ErrorResponse {
    message: string;
}

export interface ScheduleObj {
    day: string;
    timeStamps: string[];
    _id: string;
}

export interface UserData {
    _id: string;
    appointment: string | null;
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
    __v: number;
}