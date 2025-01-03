import {Cascader, Form, Modal, DatePicker} from "antd";
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
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedPlace, setSelectedPlace] = useState<string | null>(null);

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

    const fetchAvailableTimes = async (place: string, day: string) => {
        try {
            setLoading(true);
            const availableTimes = await axiosAPI.getAvailableTimes(place, day);
            const now = dayjs();
            const options = availableTimes.map((time: string) => {
                const timeObj = dayjs(`${dayjs().format("YYYY-MM-DD")}T${time}`);
                return {
                    value: time,
                    label: time,
                    disabled: timeObj.isBefore(now),
                };
            });
            setTimeOptions(options);
        } catch (error: any) {
            console.error(error);
            messageService.open({
                type: "error",
                content: "Failed to load available times for the selected place and day.",
            });
        } finally {
            setLoading(false);
        }
    };

    const onPlaceChange = (place: string) => {
        setSelectedPlace(place);
        setSelectedDay(null);
        setTimeOptions([]);
    };

    const onDayChange = (date: dayjs.Dayjs | null) => {
        if (date && selectedPlace) {
            const day = date.format("dddd").toLowerCase();
            setSelectedDay(day);
            fetchAvailableTimes(selectedPlace, day);
        } else {
            setSelectedDay(null);
            setTimeOptions([]);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setPlaceOptions([]);
        setTimeOptions([]);
        setSelectedPlace(null);
        setSelectedDay(null);
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

        try {
            const selectedDay = form.getFieldValue("day");
            const selectedTime = values.time[0];

            if (!selectedDay || !selectedTime) {
                messageService.open({type: "error", content: "Please select both day and time."});
                return;
            }

            const combinedDateTime = dayjs(selectedDay.format("YYYY-MM-DD") + "T" + selectedTime);
            if (!combinedDateTime.isValid()) {
                throw new Error("Invalid date or time.");
            }

            const timeISO = combinedDateTime.toISOString();

            const appointment = {
                time: timeISO,
                place: values.place[0],
            };

            await axiosAPI.addClientToQueue(queueId, username, appointment);

            await getQueueData(queueId);
            messageService.open({type: "success", content: "Client stepped into queue successfully!"});

            handleCancel();
        } catch (error: any) {
            console.error(error);
            messageService.open({
                type: "error",
                content: error.message || "Failed to step client into queue.",
            });
        }
    };
    ;

    return (
        <Modal
            title="Step into Queue"
            open={open}
            onOk={onOk}
            onCancel={handleCancel}
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
                    name="day"
                    label="Day"
                    rules={[{required: true, message: "Please select a day."}]}
                >
                    <DatePicker
                        placeholder="Select a day"
                        disabled={!selectedPlace}
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
                    <Cascader
                        options={timeOptions}
                        placeholder="Choose the time"
                        loading={loading}
                        disabled={!selectedDay}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default StepInQueueModalForm;
