import {BadRequestException} from "@nestjs/common";
import {ScheduleObj} from "@/schemas/timetable.schema";

export const ThrottleConfig = {
    SIGNUP: {
        default: {
            limit: 5,
            ttl: 60,
        },
    },
    SIGNIN: {
        default: {
            limit: 5,
            ttl: 60,
        },
    },
    LOGOUT: {
        default: {
            limit: 10,
            ttl: 60,
        },
    },
    CHANGE_DATA: {
        default: {
            limit: 5,
            ttl: 60,
        },
    },
    REFRESH_TOKENS: {
        default: {
            limit: 10,
            ttl: 60,
        },
    },
    PROFILE: {
        default: {
            limit: 10,
            ttl: 60,
        },
    },
    FORGOT_PASSWORD: {
        default: {
            limit: 3,
            ttl: 60,
        },
    },
    RESET_PASSWORD: {
        default: {
            limit: 3,
            ttl: 60,
        },
    },
    ADD_CLIENT: {
        default: {
            limit: 10,
            ttl: 60,
        },
    },
    ADD_PLACE: {
        default: {
            limit: 10,
            ttl: 60,
        },
    },
    CREATE_QUEUE: {
        default: {
            limit: 5,
            ttl: 60,
        },
    },
    CREATE_PLACE: {
        default: {
            limit: 5,
            ttl: 60,
        },
    },
    GET_QUEUES: {
        default: {
            limit: 20,
            ttl: 60,
        },
    },
    FIND_QUEUE: {
        default: {
            limit: 20,
            ttl: 60,
        },
    },
    DELETE_PLACE: {
        default: {
            limit: 5,
            ttl: 60,
        },
    },
    DELETE_CLIENT: {
        default: {
            limit: 5,
            ttl: 60,
        },
    },
    DELETE_QUEUE: {
        default: {
            limit: 5,
            ttl: 60,
        },
    },
    CREATE_USER: {
        default: {
            limit: 5,
            ttl: 60,
        },
    },
    FIND_ALL_USERS: {
        default: {
            limit: 10,
            ttl: 60,
        },
    },
    FIND_ONE_USER: {
        default: {
            limit: 10,
            ttl: 60,
        },
    },
    DELETE_USER: {
        default: {
            limit: 5,
            ttl: 60,
        },
    },
    APPROVE_CLIENT: {
        default: {
            limit: 5,
            ttl: 60,
        },
    },
    CANCEL_CLIENT: {
        default: {
            limit: 5,
            ttl: 60,
        },
    },
    FIND_SCHEDULE: {
        default: {
            limit: 10,
            ttl: 60,
        },
    },
    APPOINT: {
        default: {
            limit: 5,
            ttl: 60,
        },
    },
    CREATE_TIMETABLE: {
        default: {
            limit: 3,
            ttl: 60,
        },
    },
};


export const defaultSchedule: ScheduleObj[] = [
    {day: 'monday', timeStamps: ['09:00', '12:00', '18:00']},
    {day: 'tuesday', timeStamps: ['09:00', '12:00', '18:00']},
    {day: 'wednesday', timeStamps: ['09:00', '12:00', '18:00']},
    {day: 'thursday', timeStamps: ['09:00', '12:00', '18:00']},
    {day: 'friday', timeStamps: ['09:00', '12:00', '18:00']},
];
