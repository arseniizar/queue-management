import {Cascader, Form, Modal} from "antd";
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

const StepInQueueModalForm: React.FC<{
    open: boolean;
    onCancel: () => void;
    useResetFormOnCloseModal: (props: UseResetFormOnCloseModalProps) => void;
    username?: string;
}> = ({open, onCancel, useResetFormOnCloseModal, username}) => {
    const {axiosAPI, queueData, getQueueData, messageService} = useAuthContext();
    const [form] = Form.useForm();
    const [searchParams] = useSearchParams();
    const queueId = searchParams.get("queue");
    const [loading, setLoading] = useState<boolean>(false);
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
            } catch (error: any) {
                console.error(error);
                messageService.open({type: "error", content: "Failed to load queue data."});
            } finally {
                setLoading(false);
            }
        };

        fetchQueueData();
    }, [queueId, getQueueData]);

    useEffect(() => {
        if (queueData.places) {
            const cascaderOptions =
                queueData.places.map((place: any) => ({
                    value: place.userId,
                    label: place.username,
                })) || [];
            setOptions(cascaderOptions);
        }
    }, [queueData.places]);

    useResetFormOnCloseModal({
        form,
        open,
    });

    const onOk = () => {
        form.submit();
    };

    const onFinish = async (values: any) => {
        if (!queueId || !username) {
            messageService.open({type: "error", content: "Queue ID or username is missing or invalid."});
            return;
        }

        const appointment = {
            time: new Date().toISOString(),
            place: values.place[0],
        };

        try {

            await axiosAPI.addClientToQueue(queueId, username, appointment);

            await getQueueData(queueId);
            messageService.open({type: "success", content: "Client stepped into queue successfully!"});

            form.resetFields();
            onCancel();
        } catch (error: any) {
            console.error(error);
            messageService.open({
                type: "error",
                content: error.response?.data?.message || "Failed to step client into queue.",
            });
        }
    };

    return (
        <Modal
            title="Step Client into Queue"
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            destroyOnClose
        >
            <Form form={form} layout="vertical" name="stepInQueueForm" onFinish={onFinish}>
                <Form.Item
                    name="place"
                    label="Place"
                    rules={[{required: true, message: "Please select a place."}]}
                >
                    <Cascader options={options} placeholder="Choose the place" loading={loading}/>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default StepInQueueModalForm;
