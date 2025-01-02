import React, {createContext, useContext, useEffect, useState} from "react";
import {message} from "antd";
import {QueueClient, Queue, UserData} from "../interfaces";
import AxiosAPI from "../api/api.service";
import {useDebouncedMessage} from "../components/debouncedMessage/debouncedMessage";

export type AxiosAPIInstance = AxiosAPI;

export interface IAuthContext {
    isAuth: boolean;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
    messageService: ReturnType<typeof message.useMessage>[0];
    contextHolder: React.ReactNode;
    axiosAPI: AxiosAPIInstance;
    current: string;
    setCurrent: React.Dispatch<React.SetStateAction<string>>;
    userData: UserData | undefined;
    setUserData: React.Dispatch<React.SetStateAction<UserData | undefined>>;
    authProfileGetVerify: () => Promise<void>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isEmployee: boolean;
    setIsEmployee: React.Dispatch<React.SetStateAction<boolean>>;
    queues: Queue[];
    getQueues: () => Promise<void>;
    queueData: Queue;
    setQueueData: React.Dispatch<React.SetStateAction<Queue>>;
    getQueueData: (queueId: string) => Promise<void>;
}

export const AuthContext = createContext<IAuthContext | null>(null);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [isEmployee, setIsEmployee] = useState<boolean>(false);
    const [current, setCurrent] = useState<string>("1");
    const [userData, setUserData] = useState<UserData | undefined>(undefined);
    const [queues, setQueues] = useState<Queue[]>([]);
    const [queueData, setQueueData] = useState<Queue>({__v: 0, _id: "", clients: [], name: "", places: []});
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [messageService, contextHolder] = useDebouncedMessage();

    const [axiosAPI, setAxiosAPI] = useState<AxiosAPI>(
        new AxiosAPI(process.env.REACT_APP_API_URL || "http://localhost:3000", setIsAuth, isAuth)
    );

    async function authProfileGetVerify() {
        const delay =
            (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
        const token = localStorage.getItem("AuthToken");
        if (!token) {
            return;
        }

        try {
            await delay(2000);
            const profileResponse = await axiosAPI.getProfile();
            setIsAuth(true);
            try {
                const userResponse: UserData = await axiosAPI.getUser(profileResponse.username);
                setUserData(userResponse);
            } catch (userError) {
                console.error("Failed to fetch user data:", userError);
            }
        } catch (profileError) {
            setIsAuth(false);
            console.error("Failed to verify profile:", profileError);
        }
    }

    async function getQueues() {
        try {
            const queues = await axiosAPI.getQueues();
            setQueues(queues);
        } catch (error) {
            console.error("Failed to fetch queues:", error);
        }
    }

    async function getQueueData(queueId: string) {
        try {
            const fetchedQueueData = await axiosAPI.findQueueById(queueId);
            setQueueData((prevData) =>
                JSON.stringify(prevData) !== JSON.stringify(fetchedQueueData) ? fetchedQueueData : prevData
            );
        } catch (error) {
            console.error("Failed to fetch queue data:", error);
        }
    }

    useEffect(() => {

    }, []);

    return (
        <AuthContext.Provider value={{
            axiosAPI,
            userData,
            setUserData,
            getQueueData,
            setQueueData,
            queues,
            queueData,
            authProfileGetVerify,
            isEmployee,
            setIsEmployee,
            isAuth,
            setIsAuth,
            current,
            setCurrent,
            isLoading,
            setIsLoading,
            getQueues,
            messageService,
            contextHolder
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = (): IAuthContext => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuthContext must be used within an AuthContext.Provider");
    }

    return context;
};
