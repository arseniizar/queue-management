import React, {useEffect, useState} from "react";
import {Layout, message, ConfigProvider, theme, Progress, Alert} from "antd";
import NavigationBar from "./components/sider/NavigationBar";
import SiteLayout from "./components/siteLayout/SiteLayout";
import {IAuthContext, useAuthContext} from "./context/context";
import {BrowserRouter, useNavigate} from "react-router-dom";
import AppRouter from "./components/appRouter/AppRouter";
import '@ant-design/v5-patch-for-react-19';
import DebouncedButton from "./components/buttons/DebouncedButton";

const {Sider} = Layout;

const Button = DebouncedButton;

export {Button};

export default function App() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isServerHealthy, setIsServerHealthy] = useState<boolean | null>(null);

    const {isLoading, setIsLoading, axiosAPI, authProfileGetVerify, contextHolder}: IAuthContext = useAuthContext();

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    useEffect(() => {
        checkServerHealth();
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

    async function checkServerHealth() {
        try {
            const healthStatus = await axiosAPI.checkConnection();
            if (healthStatus.status === "OK" && healthStatus.database === "Connected") {
                setIsServerHealthy(true);
                const authToken = localStorage.getItem("AuthToken");
                const refreshToken = localStorage.getItem("RefreshToken");
                if (authToken && refreshToken) {
                    authProfileGetVerify();
                }
            } else {
                setIsServerHealthy(false);
            }
        } catch (error) {
            console.error("Failed to verify server health:", error);
            setIsServerHealthy(false);
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
            {contextHolder}
            <BrowserRouter>
                {isServerHealthy === false ? (
                    <Layout style={{
                        minHeight: "100vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <Alert
                            message="Server is Down"
                            description="The server is currently unavailable. Please try again later."
                            type="error"
                            showIcon
                        />
                    </Layout>
                ) : isLoading ? (
                    <Layout style={{minHeight: "100vh"}}
                            className={`loading ${progress === 100 ? 'fade-out' : ''}`}>
                        <Sider collapsible/>
                        <SiteLayout
                            toggleTheme={toggleTheme}
                            isDarkMode={isDarkMode}
                            pages={<Progress type="circle" percent={progress}/>}
                        />
                    </Layout>
                ) : (
                    <Layout style={{minHeight: "100vh"}} className="loading fade-in">
                        <NavigationBar/>
                        <SiteLayout toggleTheme={toggleTheme} isDarkMode={isDarkMode} pages={<AppRouter/>}/>
                    </Layout>
                )}
            </BrowserRouter>
        </ConfigProvider>
    );
}
