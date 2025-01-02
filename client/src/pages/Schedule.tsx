import React, {useState, useEffect} from "react";
import {Button, Typography, Spin, Space} from "antd";
import {IAuthContext, useAuthContext} from "../context/context";
import ScheduleForm from "../components/forms/ScheduleForm";
import {ScheduleObj} from "../interfaces";

const {Title} = Typography;

const Schedule: React.FC = () => {
    const {axiosAPI, messageService, userData}: IAuthContext = useAuthContext();
    const [schedule, setSchedule] = useState<ScheduleObj[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            const fetchedSchedule = await axiosAPI.getSchedule();
            setSchedule(fetchedSchedule);
        } catch (error: unknown) {
            messageService.error("Failed to fetch schedule.");
        } finally {
            setLoading(false);
        }
    };

    const createTimetable = async () => {
        try {
            setLoading(true);
            const response = await axiosAPI.createPersonalTimetable();
            setSchedule(response.schedule);
            messageService.success("Timetable created successfully!");
        } catch (error: unknown) {
            messageService.error("Failed to create timetable.");
        } finally {
            setLoading(false);
        }
    };

    const submitSchedule = async (updatedSchedule: ScheduleObj[]) => {
        if (!userData) return;

        try {
            await axiosAPI.submitSchedule(updatedSchedule, userData._id);
            setSchedule(updatedSchedule);
            messageService.success("Schedule updated successfully!");
        } catch (error: unknown) {
            messageService.error("Failed to update schedule.");
        }
    };

    return (
        <div style={{padding: "20px", maxWidth: "600px", margin: "0 auto"}}>
            {loading ? (
                <Spin size="large"/>
            ) : (
                <>
                    {schedule && schedule.length === 0 ? (
                        <Space direction="vertical" style={{width: "100%", textAlign: "center"}}>
                            <Title level={3}>Create Your Timetable!</Title>
                            <Button onClick={createTimetable} type="primary">
                                Create
                            </Button>
                        </Space>
                    ) : (
                        <ScheduleForm
                            schedule={schedule}
                            setSchedule={setSchedule}
                            onSubmit={submitSchedule}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default Schedule;
