import React, {useState} from "react";
import {Form, TimePicker, Button, Card, Space, Typography, message} from "antd";
import dayjs, {Dayjs} from "dayjs";
import {IAuthContext, useAuthContext} from "../../context/context";
import {ScheduleObj} from "../../interfaces";

const {Title} = Typography;

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const MIN_TIME_DIFFERENCE = 90;
const MIN_HOURS_PER_DAY = 3;
const MAX_HOURS_PER_DAY = 5;

interface Props {
    schedule: ScheduleObj[];
    setSchedule: React.Dispatch<React.SetStateAction<ScheduleObj[]>>;
    onSubmit: (updatedSchedule: ScheduleObj[]) => Promise<void>;
}

const ScheduleForm: React.FC<Props> = ({schedule, setSchedule, onSubmit}) => {
    const {messageService}: IAuthContext = useAuthContext();

    const handleAddTime = (day: string) => {
        const updatedSchedule = [...schedule];
        const daySchedule = updatedSchedule.find((d) => d.day === day);

        if (daySchedule) {
            daySchedule.timeStamps.push(dayjs().format("HH:mm"));
        }

        setSchedule(updatedSchedule);
    };

    const handleTimeChange = (day: string, index: number, time: Dayjs | null) => {
        if (!time) return;
        const updatedSchedule = [...schedule];
        const daySchedule = updatedSchedule.find((d) => d.day === day);

        if (daySchedule) {
            // Validate time difference
            const newTime = time.format("HH:mm");
            for (let i = 0; i < daySchedule.timeStamps.length; i++) {
                if (i !== index) {
                    const diff = Math.abs(dayjs(newTime, "HH:mm").diff(dayjs(daySchedule.timeStamps[i], "HH:mm"), "minute"));
                    if (diff < MIN_TIME_DIFFERENCE) {
                        messageService.error(`Minimum time difference is ${MIN_TIME_DIFFERENCE / 60} hours.`);
                        return;
                    }
                }
            }

            daySchedule.timeStamps[index] = newTime;
        }

        setSchedule(updatedSchedule);
    };

    const handleRemoveTime = (day: string, index: number) => {
        const updatedSchedule = [...schedule];
        const daySchedule = updatedSchedule.find((d) => d.day === day);

        if (daySchedule) {
            daySchedule.timeStamps.splice(index, 1);
        }

        setSchedule(updatedSchedule);
    };

    const canSubmit = () => {
        return daysOfWeek.every((day) => {
            const daySchedule = schedule.find((d) => d.day === day);
            if (!daySchedule) return true; // If no schedule exists for a day, it's valid
            const numTimes = daySchedule.timeStamps.length;
            if (day === "Saturday" || day === "Sunday") return true; // Optional days
            return numTimes >= MIN_HOURS_PER_DAY && numTimes <= MAX_HOURS_PER_DAY;
        });
    };

    const handleSubmit = async () => {
        try {
            await onSubmit(schedule);
        } catch (error: unknown) {
            messageService.error("Failed to submit schedule.");
        }
    };

    return (
        <div style={{padding: "20px"}}>
            <Title level={2}>Manage Your Schedule</Title>
            <Form layout="vertical">
                {daysOfWeek.map((day) => {
                    const daySchedule = schedule.find((d) => d.day === day);
                    return (
                        <Card
                            key={day}
                            title={`${day} ${day === "Saturday" || day === "Sunday" ? "(Optional)" : ""}`}
                            style={{marginBottom: "20px"}}
                        >
                            {daySchedule?.timeStamps.map((time, index) => (
                                <Space key={index} align="center" style={{display: "flex", marginBottom: "10px"}}>
                                    <TimePicker
                                        value={dayjs(time, "HH:mm")}
                                        onChange={(value) => handleTimeChange(day, index, value)}
                                        format="HH:mm"
                                    />
                                    <Button danger onClick={() => handleRemoveTime(day, index)}>
                                        Remove
                                    </Button>
                                </Space>
                            ))}
                            <Button
                                type="dashed"
                                onClick={() => handleAddTime(day)}
                                disabled={(daySchedule?.timeStamps.length || 0) >= MAX_HOURS_PER_DAY}
                            >
                                Add Time
                            </Button>
                        </Card>
                    );
                })}
                <div style={{textAlign: "center"}}>
                    <Button type="primary" onClick={handleSubmit} disabled={!canSubmit()}>
                        Submit Schedule
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default ScheduleForm;
