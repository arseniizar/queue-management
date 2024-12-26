import React, {createContext, useContext} from "react";
import {message} from "antd";
import {QueueClient, Queue} from "../interfaces";
import {AxiosAPIInstance} from "../api/api.service";

export interface IAuthContext {
    isAuth: boolean;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
    messageService: ReturnType<typeof message.useMessage>[0];
    axiosAPI: AxiosAPIInstance;
    current: string;
    setCurrent: React.Dispatch<React.SetStateAction<string>>;
    userData: QueueClient;
    setUserData: React.Dispatch<React.SetStateAction<QueueClient | undefined>>;
    authProfileGetVerify: () => Promise<void>;
    queues: Queue[];
    getQueues: () => Promise<void>;
    queueData?: Queue;
    setQueueData: React.Dispatch<React.SetStateAction<Queue | undefined>>;
    getQueueData: (queueId: string) => Promise<void>;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export const useAuthContext = (): IAuthContext => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuthContext must be used within an AuthContext.Provider");
    }

    return context;
};
