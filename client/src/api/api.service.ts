import axios, {AxiosInstance} from "axios";
import {
    Appointment,
    Place,
    PlaceAddition,
    ProfileResponse,
    Queue, QueueClient,
    User,
    UserDeletion,
    UserLogin,
} from "../interfaces";
import API_ENDPOINTS from ".";
import React from "react";

class AxiosAPI {
    private readonly axios: AxiosInstance;
    private requestTimestamps: Map<string, number> = new Map();
    private debounceTime: number = 1000;
    private debouncedEndpointPatterns: RegExp[];
    private readonly setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;

    constructor(private baseURL: string, setIsAuth: React.Dispatch<React.SetStateAction<boolean>>) {
        this.debouncedEndpointPatterns = [
            new RegExp(`^${API_ENDPOINTS.QUEUES.APPROVE_CLIENT}/.+/.+$`),
            new RegExp(`^${API_ENDPOINTS.QUEUES.CANCEL_CLIENT}/.+/.+$`),
            new RegExp(`^${API_ENDPOINTS.QUEUES.ADD_CLIENT}$`),
        ];

        this.setIsAuth = setIsAuth;

        this.axios = axios.create({
            baseURL,
            timeout: 9000,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });

        this.axios.interceptors.request.use((config) => {
            const token = localStorage.getItem("AuthToken");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            const url = config.url || "";
            if (this.isDebouncedEndpoint(url)) {
                const currentTime = Date.now();
                const lastRequestTime = this.requestTimestamps.get(url);

                if (
                    lastRequestTime &&
                    currentTime - lastRequestTime < this.debounceTime
                ) {
                    return Promise.reject(new Error("Too many requests. Please wait a moment."));
                }

                this.requestTimestamps.set(url, currentTime);
            }

            return config;
        });

        let isRefreshing = false;
        let failedQueue: any[] = [];

        this.axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const {config, response} = error;

                if (response?.status === 401 || response?.status === 403) {
                    // Handle Unauthorized Error
                    if (!config._retry) {
                        config._retry = true;

                        if (!isRefreshing) {
                            isRefreshing = true;
                            try {
                                const newToken = await this.refreshToken();
                                failedQueue.forEach((req) => req.resolve(newToken));
                                failedQueue = [];
                            } catch (refreshError) {
                                failedQueue.forEach((req) => req.reject(refreshError));
                                failedQueue = [];

                                try {
                                    await this.axios.get(API_ENDPOINTS.AUTH.LOGOUT);
                                } catch (logoutError) {
                                    console.error('Logout endpoint failed:', logoutError);
                                } finally {
                                    this.logoutUser();
                                    window.location.href = '/login';
                                }
                            } finally {
                                isRefreshing = false;
                            }
                        }

                        return new Promise((resolve, reject) => {
                            failedQueue.push({
                                resolve: (token: string) => {
                                    config.headers.Authorization = `Bearer ${token}`;
                                    resolve(this.axios(config));
                                },
                                reject: (err: any) => reject(err),
                            });
                        });
                    } else {
                        // If retry already occurred, clear local tokens and redirect
                        this.logoutUser();
                        window.location.href = '/login';
                    }
                }

                return Promise.reject(error);
            }
        );
    }


    private isDebouncedEndpoint(url: string): boolean {
        return this.debouncedEndpointPatterns.some((pattern) => pattern.test(url));
    }

    async refreshToken() {
        const refreshToken = localStorage.getItem("RefreshToken");
        if (!refreshToken) throw new Error("Refresh token missing.");
        const response = await this.post<{ accessToken: string }>(
            API_ENDPOINTS.AUTH.REFRESH_TOKEN,
            {token: refreshToken}
        );
        localStorage.setItem("AuthToken", response.accessToken);
        this.axios.defaults.headers.common["Authorization"] = `Bearer ${response.accessToken}`;
        return response.accessToken;
    }

    logoutUser(): void {
        localStorage.removeItem("AuthToken");
        localStorage.removeItem("RefreshToken");
        this.setIsAuth(false);
    }

    async login(user: UserLogin): Promise<{ accessToken: string; refreshToken: string }> {
        return this.post<{ accessToken: string; refreshToken: string }>(
            API_ENDPOINTS.AUTH.LOGIN,
            user
        ).then((data) => {
            this.axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
            localStorage.setItem("AuthToken", data.accessToken);
            localStorage.setItem("RefreshToken", data.refreshToken);
            return data;
        });
    }

    async checkConnection(): Promise<{ status: string; database: string }> {
        return this.get<{ status: string; database: string }>(API_ENDPOINTS.HEALTH.CHECK);
    }

    private post<T>(url: string, data: unknown): Promise<T> {
        return this.axios.post<T>(url, data).then((res) => res.data);
    }

    private get<T>(url: string): Promise<T> {
        return this.axios.get<T>(url).then((res) => res.data);
    }

    private patch<T>(url: string, data: unknown): Promise<T> {
        return this.axios.patch<T>(url, data).then((res) => res.data);
    }

    registration(user: User): Promise<string> {
        return this.post<string>(API_ENDPOINTS.AUTH.SIGNUP, user);
    }

    logout(): Promise<void> {
        const promise = this.get<void>(API_ENDPOINTS.AUTH.LOGOUT);
        this.logoutUser();
        return promise;
    }

    getProfile(): Promise<ProfileResponse> {
        return this.get<ProfileResponse>(API_ENDPOINTS.AUTH.PROFILE);
    }

    getUser(username: string): Promise<QueueClient> {
        return this.get<QueueClient>(`${API_ENDPOINTS.USERS.GET_BY_USERNAME}/${username}`);
    }

    forgotPassword(email: string): Promise<string> {
        return this.post<string>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {email});
    }

    resetPassword(token: string, password: string): Promise<string> {
        return this.post<string>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {token, password});
    }

    getQueues(): Promise<Queue[]> {
        return this.get<Queue[]>(API_ENDPOINTS.QUEUES.GET_ALL);
    }

    addClientToQueue(queueId: string, username: string, appointment: Appointment): Promise<void> {
        return this.post<void>(API_ENDPOINTS.QUEUES.ADD_CLIENT, {
            username,
            queueId,
            appointment,
        });
    }

    addPlaceToQueue(data: PlaceAddition): Promise<void> {
        return this.post<void>(API_ENDPOINTS.QUEUES.ADD_PLACE, data);
    }

    createPlaceInQueue(place: Place): Promise<void> {
        return this.post<void>(API_ENDPOINTS.QUEUES.CREATE_PLACE, place);
    }

    createQueue(name: string): Promise<void> {
        return this.post<void>(API_ENDPOINTS.QUEUES.CREATE_QUEUE, {name});
    }

    deleteQueue(queueId: string): Promise<void> {
        return this.patch<void>(API_ENDPOINTS.QUEUES.DELETE_QUEUE, {queueId});
    }

    deleteClient(data: UserDeletion): Promise<void> {
        return this.patch<void>(API_ENDPOINTS.QUEUES.DELETE_CLIENT, data);
    }

    deletePlace(data: UserDeletion): Promise<void> {
        return this.patch<void>(API_ENDPOINTS.QUEUES.DELETE_PLACE, data);
    }

    findQueueById(id: string): Promise<Queue> {
        return this.get<Queue>(`${API_ENDPOINTS.QUEUES.FIND_BY_ID}/${id}`);
    }

    changeData(changedUser: User): Promise<void> {
        return this.post<void>(API_ENDPOINTS.AUTH.CHANGE_DATA, changedUser);
    }

    approveClient(clientId: string, queueId: string): Promise<void> {
        return this.patch<void>(
            `${API_ENDPOINTS.QUEUES.APPROVE_CLIENT}/${clientId}/${queueId}`,
            {}
        );
    }

    cancelClient(clientId: string, queueId: string): Promise<void> {
        return this.patch<void>(
            `${API_ENDPOINTS.QUEUES.CANCEL_CLIENT}/${clientId}/${queueId}`,
            {}
        );
    }

    findSchedule(findScheduleDto: { placeId: string }): Promise<any> {
        return this.post(API_ENDPOINTS.TIMETABLES.FIND_SCHEDULE, findScheduleDto);
    }

    appoint(appointDto: {
        clientUsername: string;
        placeId: string;
        time: string;
    }): Promise<any> {
        return this.post(API_ENDPOINTS.TIMETABLES.APPOINT, appointDto);
    }

    createTimetable(createTimetableDto: { placeId: string; schedule: string[]; }): Promise<any> {
        return this.post(API_ENDPOINTS.TIMETABLES.CREATE_TIMETABLE, createTimetableDto);
    }


    async getAvailableTimes(placeId: string): Promise<string[]> {
        return this.get<string[]>(`/timetables/available-times/${placeId}`);
    }
}

export default AxiosAPI;
