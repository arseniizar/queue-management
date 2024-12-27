import React, {useEffect, useState} from "react";
import {Layout, message, ConfigProvider, theme, Progress} from "antd";
import SiderBar from "./components/Sider/SiderBar";
import SiteLayout from "./components/SiteLayout/SiteLayout";
import {AuthContext, IAuthContext} from "./context/context";
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./components/AppRouter/AppRouter";
import axiosAPI from "./api/api.service";
import '@ant-design/v5-patch-for-react-19';
import {QueueClient, Queue} from "./interfaces";

const {Sider} = Layout;

export default function App() {
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [current, setCurrent] = useState<string>("1");
    const [userData, setUserData] = useState<QueueClient | undefined>(undefined);
    const [queues, setQueues] = useState<Queue[]>([]);
    const [queueData, setQueueData] = useState<Queue>({__v: 0, _id: "", clients: [], name: "", places: []})
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [progress, setProgress] = useState(0);

    const [messageService, contextHolder] = message.useMessage();

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    useEffect(() => {
        authProfileGetVerify();
    }, []);

    useEffect(() => {
        if (isLoading) {
            let currentProgress = 0;
            const progressInterval = setInterval(() => {
                currentProgress += 5;
                setProgress(currentProgress);

                if (currentProgress >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 500);
                }
            }, 100);

            return () => clearInterval(progressInterval);
        }
    }, [isLoading]);

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
                const userResponse: QueueClient = await axiosAPI.getUser(profileResponse.username);
                setUserData(userResponse);
            } catch (userError) {
                console.error("Failed to fetch user data:", userError);
            }
        } catch (profileError) {
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
            console.log(fetchedQueueData);
            setQueueData((prevData) =>
                JSON.stringify(prevData) !== JSON.stringify(fetchedQueueData) ? fetchedQueueData : prevData
            );
        } catch (error) {
            console.error("Failed to fetch queue data:", error);
        }
    }

    return (
        <ConfigProvider
            theme={{
                algorithm: isDarkMode
                    ? theme.darkAlgorithm
                    : theme.defaultAlgorithm,
            }}
        >
            <AuthContext.Provider
                value={{
                    isAuth,
                    setIsAuth,
                    messageService,
                    axiosAPI,
                    current,
                    setCurrent,
                    userData: userData || undefined,
                    setUserData,
                    isLoading,
                    authProfileGetVerify,
                    queues,
                    getQueues,
                    queueData,
                    setQueueData,
                    getQueueData,
                }}
            >
                {contextHolder}
                <BrowserRouter>
                    {isLoading ?
                        <Layout style={{minHeight: "100vh"}}
                                className={`loading ${progress === 100 ? 'fade-out' : ''}`}
                        >
                            <Sider collapsible/>
                            <SiteLayout toggleTheme={toggleTheme} isDarkMode={isDarkMode}
                                        pages={<Progress type="circle" percent={progress}/>}/>
                        </Layout> :
                        <Layout style={{minHeight: '100vh'}}
                                className='loading fade-in'
                        >
                            <SiderBar/>
                            <SiteLayout toggleTheme={toggleTheme} isDarkMode={isDarkMode}
                                        pages={<AppRouter/>}/>
                        </Layout>
                    }
                </BrowserRouter>
            </AuthContext.Provider>
        </ ConfigProvider>
    );
}
