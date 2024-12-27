import {Form, Input, Modal} from "antd";
import React from "react";
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

const PlaceAdditionModalForm: React.FC<ModalFormProps> = ({
                                                              open,
                                                              onCancel,
                                                              useResetFormOnCloseModal,
                                                          }) => {
    const {axiosAPI, getQueueData, messageService} = useAuthContext();
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

        const additionData = {
            username: values.username,
            queueId,
        };

        try {
            console.log("Sending additionData:", additionData); // Debug log
            await axiosAPI.addPlaceToQueue(additionData);
            await getQueueData(queueId);
            messageService.open({
                type: "success",
                content: "Place added successfully!",
            });
            form.resetFields();
        } catch (error: any) {
            console.error("Error adding place:", error.response || error);
            messageService.open({
                type: "error",
                content: error.response?.data?.message || "Failed to add place.",
            });
        }
    };

    return (
        <Modal
            title="Add Place to Queue"
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                name="placeAdditionForm"
                onFinish={onFinish}
            >
                <Form.Item
                    name="username"
                    label="Username"
                    rules={[
                        {required: true, message: "Please input the username."},
                        {pattern: /^[a-zA-Z0-9_]+$/, message: "Invalid username format."},
                    ]}
                >
                    <Input placeholder="Enter username"/>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PlaceAdditionModalForm;
