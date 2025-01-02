import {Cascader, Form, Input, Modal, Select, DatePicker} from "antd";
import React, {useEffect, useState} from "react";
import {useAuthContext} from "../../context/context";
import {useSearchParams} from "react-router-dom";
import dayjs from "dayjs";

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
    const [availableTimes, setAvailableTimes] = useState<
        { value: string; label: string; disabled: boolean }[]
    >([]);
    const [isUsernameEntered, setIsUsernameEntered] = useState<boolean>(false);
    const [isPlaceSelected, setIsPlaceSelected] = useState<boolean>(false);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

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

    const fetchAvailableTimes = async (placeId: string, day: string) => {
        try {
            const now = dayjs();
            const times = await axiosAPI.getAvailableTimes(placeId, day);

            const processedTimes = times.map((time: string) => {
                const timeObj = dayjs(`${dayjs().format("YYYY-MM-DD")}T${time}`);
                return {
                    value: time,
                    label: time,
                    disabled: timeObj.isBefore(now),
                };
            });

            setAvailableTimes(processedTimes);
        } catch (error) {
            messageService.open({type: "error", content: "Failed to fetch available times."});
        }
    };

    const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsUsernameEntered(!!e.target.value);
    };

    const onPlaceChange = (value: (string | number)[]) => {
        const selectedPlace = value[value.length - 1] as string;
        setIsPlaceSelected(!!selectedPlace);

        if (!selectedPlace || !selectedDay) {
            setAvailableTimes([]);
        } else if (selectedDay) {
            fetchAvailableTimes(selectedPlace, selectedDay);
        }
    };

    const onDayChange = (date: dayjs.Dayjs | null) => {
        if (date) {
            const day = date.format("dddd").toLowerCase();
            setSelectedDay(day);
            if (isPlaceSelected && form.getFieldValue("place")) {
                const selectedPlace = form.getFieldValue("place")[0];
                fetchAvailableTimes(selectedPlace, day);
            }
        } else {
            setSelectedDay(null);
            setAvailableTimes([]);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setOptions([]);
        setAvailableTimes([]);
        setIsPlaceSelected(false);
        setSelectedDay(null);
        setIsUsernameEntered(false);
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

        try {
            const date = values.day.format("YYYY-MM-DD");
            const time = values.time;
            const isoTime = dayjs(`${date}T${time}`).toISOString();

            const clientData = {
                username: values.username,
                queueId,
                time: isoTime,
                place: Array.isArray(values.place) ? values.place[0] : values.place,
            };

            await axiosAPI.addClientToQueue(clientData.queueId, clientData.username, {
                time: clientData.time,
                place: clientData.place,
            });

            await getQueueData(queueId);
            messageService.open({type: "success", content: "Client added successfully!"});

            handleCancel();
        } catch (error: any) {
            console.error(error);
            messageService.open({
                type: "error",
                content: "Failed to add client.",
            });
        }
    };
    ;

    return (
        <Modal
            title="Add Client to Queue"
            open={open}
            onOk={onOk}
            onCancel={handleCancel}
            destroyOnClose
        >
            <Form form={form} layout="vertical" name="clientForm" onFinish={onFinish}>
                <Form.Item name="username" label="Username" rules={[{required: true}]}>
                    <Input placeholder="Enter username" onChange={onUsernameChange}/>
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
                        disabled={!isUsernameEntered}
                    />
                </Form.Item>
                <Form.Item
                    name="day"
                    label="Day"
                    rules={[{required: true, message: "Please select a day."}]}
                >
                    <DatePicker
                        placeholder="Select a day"
                        disabled={!isPlaceSelected}
                        disabledDate={(current) =>
                            !current || current < dayjs().startOf("day") || current > dayjs().add(1, "year")
                        }
                        onChange={onDayChange}
                    />
                </Form.Item>
                <Form.Item
                    name="time"
                    label="Time"
                    rules={[{required: true, message: "Please select a time."}]}
                >
                    <Select placeholder="Select available time" disabled={!selectedDay} loading={loading}>
                        {availableTimes.map((time) => (
                            <Select.Option key={time.value} value={time.value} disabled={time.disabled}>
                                {time.label}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ClientAdditionModalForm;
