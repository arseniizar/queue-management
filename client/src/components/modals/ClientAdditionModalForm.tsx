import {Cascader, Form, Input, Modal, Select} from "antd";
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
    const [loading, setLoading] = useState<boolean>(false);
    const [options, setOptions] = useState<Option[]>([]);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [isPlaceSelected, setIsPlaceSelected] = useState<boolean>(false);

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
    }, [queueId]);

    useEffect(() => {
        if (queueData?.places) {
            const cascaderOptions = queueData.places.map((place: any) => ({
                value: place.userId,
                label: place.username,
            })) || [];
            setOptions(cascaderOptions);
        }
    }, [queueData.places]);

    const fetchAvailableTimes = async (placeId: string) => {
        try {
            const times = await axiosAPI.getAvailableTimes(placeId);
            setAvailableTimes(times);
        } catch (error) {
            messageService.open({type: "error", content: "Failed to fetch available times."});
        }
    };

    const onPlaceChange = (value: (string | number)[]) => {
        const selectedPlace = value[value.length - 1] as string;
        if (selectedPlace) {
            setIsPlaceSelected(true);
            fetchAvailableTimes(selectedPlace);
        } else {
            setIsPlaceSelected(false);
            setAvailableTimes([]);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setOptions([]);
        setAvailableTimes([]);
        setIsPlaceSelected(false);
        onCancel();
    };

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
            time: values.time,
            place: Array.isArray(values.place) ? values.place[0] : values.place,
        };

        try {
            await axiosAPI.appoint({
                clientUsername: clientData.username,
                time: clientData.time,
                placeId: clientData.place,
            });
            await axiosAPI.addClientToQueue(clientData.queueId, clientData.username, {
                time: clientData.time,
                place: clientData.place,
            });
            await getQueueData(queueId);
            messageService.open({type: "success", content: "Client added successfully!"});
            handleCancel(); // Close the modal and reset state
        } catch (error: any) {
            console.error(error);
            messageService.open({
                type: "error",
                content: "Failed to add client.",
            });
        }
    };

    return (
        <Modal
            title="Add Client to Queue"
            open={open}
            onOk={onOk}
            onCancel={handleCancel} // Use custom cancel logic
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
                        onChange={onPlaceChange}
                    />
                </Form.Item>
                <Form.Item
                    name="time"
                    label="Time"
                    rules={[{required: true, message: "Please select a time."}]}
                >
                    <Select placeholder="Select available time" disabled={!isPlaceSelected} loading={loading}>
                        {availableTimes.map((time) => (
                            <Select.Option key={time} value={time}>
                                {time}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ClientAdditionModalForm;
