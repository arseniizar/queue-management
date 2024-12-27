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
    const [placeOptions, setPlaceOptions] = useState<Option[]>([]);
    const [timeOptions, setTimeOptions] = useState<Option[]>([]);
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
    }, [queueId, getQueueData]);

    useEffect(() => {
        if (queueData.places) {
            const cascaderOptions =
                queueData.places.map((place: any) => ({
                    value: place.userId,
                    label: place.username,
                })) || [];
            setPlaceOptions(cascaderOptions);
        }
    }, [queueData.places]);

    useResetFormOnCloseModal({
        form,
        open,
    });

    const onPlaceChange = async (selectedPlace: string) => {
        if (!selectedPlace) {
            setIsPlaceSelected(false);
            setTimeOptions([]);
            return;
        }

        setIsPlaceSelected(true);
        try {
            setLoading(true);
            const availableTimes = await axiosAPI.getAvailableTimes(selectedPlace);
            const options = availableTimes.map((time: string) => ({
                value: time,
                label: time,
            }));
            setTimeOptions(options);
        } catch (error: any) {
            console.error(error);
            messageService.open({
                type: "error",
                content: "Failed to load available times for the selected place.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setPlaceOptions([]);
        setTimeOptions([]);
        setIsPlaceSelected(false);
        onCancel();
    };

    const onOk = () => {
        form.submit();
    };

    const onFinish = async (values: any) => {
        if (!queueId || !username) {
            messageService.open({type: "error", content: "Queue ID or username is missing or invalid."});
            return;
        }

        const appointment = {
            time: values.time,
            place: values.place[0],
        };

        try {
            await axiosAPI.addClientToQueue(queueId, username, appointment);

            await getQueueData(queueId);
            messageService.open({type: "success", content: "Client stepped into queue successfully!"});

            handleCancel(); // Close the modal and reset state
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
            onCancel={handleCancel} // Use custom cancel handler
            destroyOnClose
        >
            <Form form={form} layout="vertical" name="stepInQueueForm" onFinish={onFinish}>
                <Form.Item
                    name="place"
                    label="Place"
                    rules={[{required: true, message: "Please select a place."}]}
                >
                    <Cascader
                        options={placeOptions}
                        placeholder="Choose the place"
                        loading={loading}
                        onChange={(value) => onPlaceChange(value[0] as string)}
                    />
                </Form.Item>
                <Form.Item
                    name="time"
                    label="Time"
                    rules={[{required: true, message: "Please select a time."}]}
                >
                    <Cascader
                        options={timeOptions}
                        placeholder="Choose the time"
                        loading={loading}
                        disabled={!isPlaceSelected}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default StepInQueueModalForm;
