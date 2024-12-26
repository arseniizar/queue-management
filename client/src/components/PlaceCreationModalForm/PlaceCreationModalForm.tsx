import React from "react";
import {Form, Input, Modal} from "antd";
import {useAuthContext} from "../../context/context";
import {useSearchParams} from "react-router-dom";

interface UseResetFormOnCloseModalProps {
    form: any;
    open: boolean;
}

interface ModalFormProps {
    open: boolean;
    onCancel: () => void;
    useResetFormOnCloseModal: (props: UseResetFormOnCloseModalProps) => void;
}

const PlaceCreationModalForm: React.FC<ModalFormProps> = ({
                                                              open,
                                                              onCancel,
                                                              useResetFormOnCloseModal,
                                                          }) => {
    const {
        axiosAPI,
        getQueueData,
        messageService,
    } = useAuthContext();

    const [searchParams] = useSearchParams();
    const [form] = Form.useForm();
    const queueId = searchParams.get("queue");

    useResetFormOnCloseModal({
        form,
        open,
    });

    const onOk = () => {
        form.submit();
    };

    const onFinish = async (values: any) => {
        if (!queueId) {
            messageService.open({
                type: "error",
                content: "Queue ID is missing.",
            });
            return;
        }

        const place = {
            username: values.username,
            password: values.password,
            phone: values.phone,
            email: values.email,
            queueId,
            roles: "employee",
        };

        try {
            await axiosAPI.createPlaceInQueue(place);
            await getQueueData(queueId);
            messageService.open({
                type: "success",
                content: "Place created successfully!",
            });
            form.resetFields();
        } catch (error: any) {
            messageService.open({
                type: "error",
                content: error.response?.data?.message || "Failed to create place.",
            });
        }
    };

    return (
        <Modal
            title="Create Place for Queue"
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                name="placeCreationForm"
                onFinish={onFinish}
            >
                <Form.Item
                    name="username"
                    label="Username"
                    rules={[
                        {required: true, message: "Please input the username."},
                    ]}
                >
                    <Input placeholder="Enter username"/>
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        {required: true, message: "Please input the email."},
                        {type: "email", message: "Please enter a valid email."},
                    ]}
                >
                    <Input placeholder="Enter email"/>
                </Form.Item>
                <Form.Item
                    name="phone"
                    label="Phone"
                    rules={[
                        {required: true, message: "Please input the phone number."},
                    ]}
                >
                    <Input placeholder="Enter phone number"/>
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                        {required: true, message: "Please input the password."},
                        {min: 6, message: "Password must be at least 6 characters long."},
                    ]}
                >
                    <Input.Password placeholder="Enter password"/>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PlaceCreationModalForm;
