import {Cascader, Form, Input, Modal} from "antd";
import React, {useEffect, useState} from "react";
import {useAuthContext} from "../../context/context";
import {useSearchParams} from "react-router-dom";

interface UseResetFormOnCloseModalProps {
    form: any;
    open: boolean;
}

interface Option {
    value: string | number;
    label: string;
    children?: Option[];
}

const ClientAdditionModalForm: React.FC<{
    open: boolean;
    onCancel: () => void;
    useResetFormOnCloseModal: (props: UseResetFormOnCloseModalProps) => void;
}> = ({open, onCancel, useResetFormOnCloseModal}) => {
    const {axiosAPI, queueData, getQueueData, messageService} = useAuthContext();
    const [form] = Form.useForm();
    const [searchParams] = useSearchParams();
    const queueId = searchParams.get("queue");
    const [loading, setLoading] = useState<boolean>(true);
    const [options, setOptions] = useState<Option[]>([]);

    useEffect(() => {
        if (!queueId) {
            messageService.open({type: "error", content: "Queue ID is missing or invalid."});
            return;
        }

        const fetchQueueData = async () => {
            setLoading(true);
            try {
                await getQueueData(queueId);
                const cascaderOptions = queueData?.places.map((place: any) => ({
                    value: place.userId,
                    label: place.username,
                })) || [];
                setOptions(cascaderOptions);
            } catch (error: any) {
                console.error(error);
                messageService.open({type: "error", content: "Failed to load queue data."});
            } finally {
                setLoading(false);
            }
        };

        fetchQueueData();
    }, [queueId, queueData, getQueueData, messageService]);

    useResetFormOnCloseModal({
        form,
        open,
    });

    const onOk = () => {
        form.submit();
    };

    const onFinish = async (values: any) => {
        if (!queueId) {
            messageService.open({type: "error", content: "Queue ID is missing or invalid."});
            return;
        }

        const clientData = {
            username: values.username,
            queueId,
            appointment: {
                place: values.place[0],
                time: new Date().toISOString(),
            },
        };

        try {
            await axiosAPI.addClientToQueue(clientData.queueId, clientData.username, {
                time: clientData.appointment.time,
                place: clientData.appointment.place
            });
            await getQueueData(queueId);
            messageService.open({type: "success", content: "Client added successfully!"});
            form.resetFields();
        } catch (error: any) {
            console.error(error);
            messageService.open({
                type: "error",
                content: error.response?.data?.message || "Failed to add client.",
            });
        }
    };

    return (
        <Modal
            title="Add Client to Queue"
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            destroyOnClose
        >
            <Form form={form} layout="vertical" name="clientForm" onFinish={onFinish}>
                <Form.Item name="username" label="Username" rules={[{required: true}]}>
                    <Input placeholder="Enter username"/>
                </Form.Item>
                <Form.Item
                    name="place"
                    label="Place"
                    rules={[{required: true, message: "Please select a place."}]}
                >
                    <Cascader
                        options={options}
                        placeholder="Choose the place"
                        loading={loading}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ClientAdditionModalForm;
