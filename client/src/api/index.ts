const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/signin",
        SIGNUP: "/auth/signup",
        LOGOUT: "/auth/logout",
        PROFILE: "/auth/profile",
        FORGOT_PASSWORD: "/auth/forgot-password",
        RESET_PASSWORD: "/auth/reset-password",
        REFRESH_TOKEN: "/auth/refresh-token",
        CHANGE_DATA: "/auth/change-data",
    },
    QUEUES: {
        GET_ALL: "/queues/get-queues",
        ADD_CLIENT: "/queues/add-client",
        ADD_PLACE: "/queues/add-place",
        CREATE_QUEUE: "/queues/create-queue",
        CREATE_PLACE: "/queues/create-place",
        DELETE_QUEUE: "/queues/delete-queue",
        DELETE_CLIENT: "/queues/delete-client",
        DELETE_PLACE: "/queues/delete-place",
        APPROVE_CLIENT: "/queues/approve",
        CANCEL_CLIENT: "/queues/cancel",
        FIND_BY_ID: "/queues",
    },
    USERS: {
        GET_BY_USERNAME: "/users",
    },
    HEALTH: {
        CHECK: "/health-check",
    },
    TIMETABLES: {
        FIND_SCHEDULE: "/timetables/find-schedule",
        APPOINT: "/timetables/appoint",
        CREATE_TIMETABLE: "/timetables/create",
        CREATE_PERSONAL_TIMETABLE: "/timetables/create-personal",
        AVAILABLE_TIMES: "/timetables/available-times",
        ADD_TIME: "/timetables/add-time",
        MY_SCHEDULE: "/timetables/my-schedule",
        REMOVE_TIME: "/timetables/remove-time",
    },
};

export default API_ENDPOINTS;
