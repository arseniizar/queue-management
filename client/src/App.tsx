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


export default function App() {
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [current, setCurrent] = useState<string>("1");
    const [userData, setUserData] = useState<QueueClient>();
    const [queues, setQueues] = useState<Queue[]>([]);
    const [queueData, setQueueData] = useState<Queue>()
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState(0);

    const [messageService, contextHolder] = message.useMessage();

    const emptyUser: QueueClient = {
        appointment: {place: "", time: ""},
        approved: false,
        cancelled: false,
        email: "",
        key: "",
        password: "",
        phone: "",
        processed: false,
        refreshToken: "",
        roles: "",
        username: "",
        __v: 0,
        _id: ""
    };

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    useEffect(() => {
        setIsLoading(true);
        authProfileGetVerify().then(r => null);
    }, [isAuth]);

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
        const token = localStorage.getItem("AuthToken");
        if (token) {
            axiosAPI
                .getProfile()
                .then((response: any) => {
                    setIsAuth(true);
                    axiosAPI
                        .getUser(response.data.username)
                        .then((response: any) => {
                            setUserData(response.data);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                })
                .catch((error: any) => {
                    console.log(error);
                });
        }
    }

    async function getQueues() {
        axiosAPI
            .getQueues()
            .then((response: any) => {
                setQueues(response.data);
            })
            .catch((error: any) => {
                console.log(error);
            });
    }

    async function getQueueData(queueId: string) {
        axiosAPI
            .findQueueById(queueId)
            .then((response: any) => {
                setQueueData(response.data);
            })
            .catch((error: any) => {
                console.log(error);
            });
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
                    userData: userData || emptyUser,
                    setUserData,
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
                    <Layout style={{minHeight: "100vh"}}>
                        <SiderBar/>
                        {isLoading ?
                            <SiteLayout toggleTheme={toggleTheme} isDarkMode={isDarkMode}
                                        className={`loading ${progress === 100 ? 'fade-out' : ''}`}
                                        pages={<Progress type="circle" percent={progress}/>}/> :
                            <SiteLayout toggleTheme={toggleTheme} isDarkMode={isDarkMode} className='loading fade-in'
                                        pages={<AppRouter/>}/>
                        }
                    </Layout>
                </BrowserRouter>
            </AuthContext.Provider>
        </ ConfigProvider>
    );
}
