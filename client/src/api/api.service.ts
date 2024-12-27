import axios, {AxiosInstance, AxiosResponse} from "axios";
import {
    Appointment,
    Place,
    PlaceAddition,
    ProfileResponse, Queue,
    QueueClient,
    User,
    UserDeletion,
    UserLogin,
} from "../interfaces";

class AxiosAPI {
    private axios: AxiosInstance;

    constructor(private baseURL: string) {
        this.axios = axios.create({
            baseURL,
            timeout: 9000,
        });

        this.axios.interceptors.request.use((config) => {
            const token = localStorage.getItem("AuthToken");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        this.axios.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error("Axios error:", error);
                return Promise.reject(error);
            }
        );
    }

    // Helper method for POST requests
    private post<T>(url: string, data: unknown): Promise<T> {
        return this.axios.post<T>(url, data).then((res) => res.data);
    }

    // Helper method for GET requests
    private get<T>(url: string): Promise<T> {
        return this.axios.get<T>(url).then((res) => res.data);
    }

    // Helper method for PATCH requests
    private patch<T>(url: string, data: unknown): Promise<T> {
        return this.axios.patch<T>(url, data).then((res) => res.data);
    }

    // Auth methods
    registration(user: User): Promise<string> {
        return this.post<string>("/auth/signup", user);
    }

    login(user: UserLogin): Promise<{ accessToken: string }> {
        return this.post<{ accessToken: string }>("/auth/signin", user).then(
            (data) => {
                this.axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
                localStorage.setItem("AuthToken", data.accessToken);
                return data;
            }
        );
    }

    logout(): Promise<void> {
        return this.get<void>("/auth/logout");
    }

    getProfile(): Promise<ProfileResponse> {
        return this.get<ProfileResponse>("auth/profile");
    }

    getUser(username: string): Promise<QueueClient> {
        return this.get<QueueClient>(`/users/${username}`);
    }

    forgotPassword(email: string): Promise<string> {
        return this.post<string>("/auth/forgot-password", {email});
    }

    resetPassword(token: string, password: string): Promise<string> {
        return this.post<string>("/auth/reset-password", {token, password});
    }

    // Queue methods
    getQueues(): Promise<Queue[]> {
        return this.get<Queue[]>("/queues/get-queues");
    }

    addClientToQueue(
        queueId: string,
        username: string,
        appointment: Appointment
    ): Promise<void> {
        return this.post<void>("/queues/add-client", {
            username,
            queueId,
            appointment,
        });
    }

    addPlaceToQueue(data: PlaceAddition): Promise<void> {
        return this.post<void>("/queues/add-place", data);
    }

    createPlaceInQueue(place: Place): Promise<void> {
        return this.post<void>("/queues/create-place", place);
    }

    createQueue(name: string): Promise<void> {
        return this.post<void>("/queues/create-queue", {name});
    }

    deleteQueue(queueId: string): Promise<void> {
        return this.patch<void>("/queues/delete-queue", {queueId});
    }

    deleteClient(data: UserDeletion): Promise<void> {
        return this.patch<void>("/queues/delete-client", data);
    }

    deletePlace(data: UserDeletion): Promise<void> {
        return this.patch<void>("/queues/delete-place", data);
    }

    findQueueById(id: string): Promise<Queue> {
        return this.get<Queue>(`/queues/${id}`);
    }

    changeData(changedUser: User): Promise<void> {
        return this.post<void>("/auth/change-data", changedUser);
    }

    /**
     * Approve a client in the queue.
     * @param clientId The ID of the client to approve.
     * @param queueId The ID of the queue.
     */
    approveClient(clientId: string, queueId: string): Promise<void> {
        return this.patch<void>("/queues/approve-client", {clientId, queueId});
    }

    /**
     * Cancel a client in the queue.
     * @param clientId The ID of the client to cancel.
     * @param queueId The ID of the queue.
     */
    cancelClient(clientId: string, queueId: string): Promise<void> {
        return this.patch<void>("/queues/cancel-client", {clientId, queueId});
    }
}

const axiosAPI = new AxiosAPI("http://localhost:3000");

export type AxiosAPIInstance = typeof axiosAPI;
export default axiosAPI;
