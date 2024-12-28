import React, {useEffect, useRef, useState} from "react";
import {
    SmileOutlined,
    UserOutlined,
    InfoCircleOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import {Avatar, Button, Form, Input, Modal, Typography, Table} from "antd";
import type {FormInstance} from "antd/es/form";
import {useAuthContext} from "../context/context";
import {Link} from "react-router-dom";
import QueueModalForm from "../components/modals/QueueModalForm";
import {Queue, QueueClient, QueuePlace} from "../interfaces";

const {Title, Text} = Typography;

const useResetFormOnCloseModal = ({
                                      form,
                                      open,
                                  }: {
    form: FormInstance;
    open: boolean;
}) => {
    const prevOpenRef = useRef<boolean>(open);
    useEffect(() => {
        prevOpenRef.current = open;
    }, [open]);
    const prevOpen = prevOpenRef.current;

    useEffect(() => {
        if (!open && prevOpen) {
            form.resetFields();
        }
    }, [form, prevOpen, open]);
};

const Queues: React.FC = () => {
    const {setCurrent, axiosAPI, getQueues, queues, messageService} =
        useAuthContext();
    const [openQueueModal, setOpenQueueModal] = useState(false);

    useEffect(() => {
        setCurrent("queues");
        getQueues();
    }, []);

    const deleteQueue = (queueId: string) => {
        axiosAPI
            .deleteQueue(queueId)
            .then((response: any) => {
                console.log(response);
                getQueues();
                messageService.open({
                    type: "success",
                    content: "Queue deleted",
                });
            })
            .catch((error: any) => {
                console.log(error);
                messageService.open({
                    type: "error",
                    content: error.response?.data?.message,
                });
            });
    };

    const showQueueModal = () => {
        setOpenQueueModal(true);
    };

    const hideQueueModal = () => {
        setOpenQueueModal(false);
    };

    return (
        <>
            <Button
                htmlType="button"
                className="createQueueButton"
                onClick={showQueueModal}
            >
                Create queue
            </Button>
            <div className="queuesContainer">
                <Form.Provider
                    onFormFinish={(name) => {
                        if (name === "queueForm") {
                            setOpenQueueModal(false);
                        }
                    }}
                >
                    {queues.map((queue: Queue) => {
                        return (
                            <Form name="basicForm" className="queueForm" key={queue._id}>
                                <div className="queueFormHeader">
                                    <Form.Item>
                                        <Title
                                            level={3}
                                            className="ant-form-text"
                                            title="Queue name"
                                        >
                                            {queue.name}
                                        </Title>
                                    </Form.Item>
                                    <Form.Item>
                                        <Button
                                            type="text"
                                            danger
                                            onClick={() => deleteQueue(queue._id)}
                                        >
                                            <CloseOutlined/>
                                        </Button>
                                    </Form.Item>
                                </div>
                                <Form.Item
                                    shouldUpdate={(prevValues, curValues) =>
                                        prevValues.users !== curValues.users
                                    }
                                >
                                    {() => {
                                        const users: QueueClient[] = queue.clients;
                                        const places: QueuePlace[] = queue.places;

                                        const placeColumns = [
                                            {
                                                title: "Place Name",
                                                dataIndex: "username",
                                                key: "username",
                                                render: (text: string) => (
                                                    <div style={{display: "flex", alignItems: "center"}}>
                                                        <Avatar
                                                            icon={<UserOutlined/>}
                                                            style={{
                                                                marginRight: "8px",
                                                                backgroundColor: "#87d068",
                                                            }}
                                                        />
                                                        {text}
                                                    </div>
                                                ),
                                            },
                                            {
                                                title: "Email",
                                                dataIndex: "email",
                                                key: "email",
                                            },
                                            {
                                                title: "Phone",
                                                dataIndex: "phone",
                                                key: "phone",
                                            },
                                        ];

                                        return users.length || places.length ? (
                                            <div className="usersContainer">
                                                {places.length ? (
                                                    <>
                                                        <Title className="ant-form-text" level={4}>
                                                            Place List:
                                                        </Title>
                                                        <Table
                                                            dataSource={places}
                                                            columns={placeColumns}
                                                            rowKey="username"
                                                            pagination={false}
                                                            style={{marginBottom: "16px"}}
                                                        />
                                                    </>
                                                ) : null}

                                                {users.length ? (
                                                    <>
                                                        <Text className="ant-form-text" strong>
                                                            Client List:
                                                        </Text>
                                                        <ul>
                                                            {users.map((client: QueueClient) => (
                                                                <li
                                                                    key={client.username}
                                                                    className="user"
                                                                >
                                                                    <Avatar
                                                                        icon={<UserOutlined/>}
                                                                        className="userIcon"
                                                                    />
                                                                    {client.username}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </>
                                                ) : null}
                                            </div>
                                        ) : (
                                            <Text className="ant-form-text" type="secondary">
                                                ( <SmileOutlined/> No user yet. )
                                            </Text>
                                        );
                                    }}
                                </Form.Item>
                                <Form.Item>
                                    <Link to={`/queue-details?queue=${queue._id}`}>
                                        <Button htmlType="button">
                                            Details <InfoCircleOutlined/>
                                        </Button>
                                    </Link>
                                </Form.Item>
                            </Form>
                        );
                    })}
                    <QueueModalForm
                        useResetFormOnCloseModal={useResetFormOnCloseModal}
                        open={openQueueModal}
                        onCancel={hideQueueModal}
                    />
                </Form.Provider>
            </div>
        </>
    );
};

export default Queues;
