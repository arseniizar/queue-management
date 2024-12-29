import React, {useState, useEffect} from "react";
import {Form, Button, Input, List, Typography, Flex} from "antd";
import {IAuthContext, useAuthContext} from "../context/context";
import axios, {AxiosError} from "axios";

const {Title} = Typography;

const Schedule: React.FC = () => {
    const {axiosAPI, messageService}: IAuthContext = useAuthContext();
    const [schedule, setSchedule] = useState<string[]>([]);
    const [newTime, setNewTime] = useState<string>("");

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const schedule = await axiosAPI.getSchedule();
            setSchedule(schedule);
        } catch (error: unknown) {
            messageService.error("Failed to fetch schedule.");
        }
    };

    const addTime = async () => {
        if (schedule === undefined) return;

        if (!validateTime(newTime)) {
            messageService.error("Invalid time format or time in past/far future.");
            return;
        }
        if (schedule.length >= 5) {
            messageService.error("Maximum of 5 times allowed in schedule.");
            return;
        }
        try {
            const response = await axiosAPI.addTimeToSchedule(newTime);
            setSchedule(response.schedule);
            messageService.success("Time added successfully!");
            setNewTime("");
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                console.error(error.response.status);
            } else {
                console.error("An unknown error occurred.");
            }
            messageService.error("Failed to add time.");
        }
    };

    const removeTime = async (time: string) => {
        try {
            const response = await axiosAPI.removeTimeFromSchedule(time);
            setSchedule(response.schedule);
            messageService.success("Time removed successfully!");
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                console.error(error.response.status);
            } else {
                console.error("An unknown error occurred.");
            }
            messageService.error("Failed to remove time.");
        }
    };

    const validateTime = (time: string): boolean => {
        const [hours, minutes] = time.split(":").map(Number);
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return false;
        }
        const now = new Date();
        const todayTime = new Date();
        todayTime.setDate(todayTime.getDate() + 1);
        todayTime.setHours(hours, minutes, 0, 0);
        return todayTime > now && todayTime.getTime() < now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000;
    };

    const createTimetable = async () => {
        try {
            const response = await axiosAPI.createPersonalTimetable();
            setSchedule(response.schedule);
            messageService.success("Timetable created successfully!");
        } catch (error: unknown) {
            messageService.error("Failed to create timetable.");
        }
    }

    return (
        <div style={{padding: "20px", maxWidth: "600px", margin: "0 auto"}}>
            {schedule.length === 0 ?
                <Flex vertical={true}>
                    <Title level={3}> Create Your Timetable! </ Title>
                    <Button onClick={createTimetable} type='primary'>Create</Button>
                </Flex> : <>
                    <Title level={3}>Manage Your Schedule</Title>
                    <Form layout="inline" onFinish={addTime}>
                        <Form.Item>
                            <Input
                                value={newTime}
                                placeholder="HH:MM"
                                onChange={(e) => setNewTime(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" disabled={schedule.length >= 5}>
                                Add Time
                            </Button>
                        </Form.Item>
                    </Form>
                    <List
                        bordered
                        dataSource={schedule}
                        renderItem={(time) => (
                            <List.Item
                                actions={[
                                    <Button danger disabled={schedule.length <= 3}
                                            onClick={() => removeTime(time)}>
                                        Remove
                                    </Button>,
                                ]}
                            >
                                {time}
                            </List.Item>
                        )}
                    />
                </>}
        </div>
    );
};

export default Schedule;
