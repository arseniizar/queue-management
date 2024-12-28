import React, {useEffect, useState} from "react";
import {Button, Card, Flex, Space, Typography} from "antd";
import "./WelcomeComponent.scss";
import {routerPaths} from "../../router/router";
import {useNavigate} from "react-router-dom";

const {Title} = Typography;

const generateName = (index: number) => {
    const names = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace"];
    return names[index % names.length];
};

const WelcomeComponent: React.FC = () => {
    const [queue, setQueue] = useState<{ id: number; name: string; className: string }[]>([
        {id: 1, name: "Alice", className: "entering"},
        {id: 2, name: "Bob", className: "entering"},
        {id: 3, name: "Charlie", className: "entering"},
        {id: 4, name: "Diana", className: "entering"},
    ]);
    const [isQueueVisible, setIsQueueVisible] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        const initializeQueue = setTimeout(() => {
            setQueue((prevQueue) =>
                prevQueue.map((item) => ({...item, className: "moving"}))
            );
        }, 50);

        let index = 5;
        const interval = setInterval(() => {
            setQueue((prevQueue) => {
                const newBall = {id: index++, name: generateName(index), className: "entering"};

                const updatedQueue = [
                    newBall,
                    ...prevQueue.map((item) => ({...item, className: "moving"})),
                ];

                setIsQueueVisible(true);

                setTimeout(() => {
                    setQueue((currentQueue) =>
                        currentQueue.map((item, idx) =>
                            idx === currentQueue.length - 1
                                ? {...item, className: "exiting"}
                                : item
                        )
                    );
                }, 1500);

                setTimeout(() => {
                    setQueue((currentQueue) => currentQueue.slice(0, -1));
                }, 2200);

                return updatedQueue;
            });
        }, 2200);

        return () => {
            clearInterval(interval);
            clearTimeout(initializeQueue);
        };
    }, []);

    return (
        <div className="welcome-container">
            <div className="queue-animation-wrapper">
                <div className={`queue-animation ${!isQueueVisible ? "hidden" : ""}`}>
                    {queue.map((item) => (
                        <div
                            key={item.id}
                            className={`queue-ball ${item.className}`}
                        >
                            {item.name}
                        </div>
                    ))}
                </div>
            </div>
            <Card className="welcome-card" bordered={false}>
                <Title level={2}>Welcome to Queue Manager!</Title>
                <Flex vertical={true} align={'center'}>
                    <Typography.Text>
                        Queue Manager is a simple application to help manage queues and appointments.
                        It includes features for scheduling, adding clients, and keeping track of active queues.
                    </Typography.Text>
                    <br/>
                    <Button type="primary" size="large" onClick={() => navigate(routerPaths.guide)}>
                        Get Started
                    </Button>
                </Flex>
            </Card>
        </div>
    );
};

export default WelcomeComponent;
