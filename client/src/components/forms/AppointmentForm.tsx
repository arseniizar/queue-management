import React from 'react';
import {Form, DatePicker, TimePicker, Button} from 'antd';
import {Dayjs} from 'dayjs';
import {IAuthContext, useAuthContext} from "../../context/context";
import dayjs from "dayjs";

const AppointmentForm: React.FC = () => {
    const [form] = Form.useForm();
    const {messageService}: IAuthContext = useAuthContext();

    const onFinish = (values: { date: Dayjs; time: Dayjs }) => {
        const selectedDate = values.date.clone();
        const selectedTime = values.time;

        selectedDate.set('hour', selectedTime.hour());
        selectedDate.set('minute', selectedTime.minute());
        selectedDate.set('second', 0);

        const isoString = selectedDate.toISOString();
        console.log('Selected Date and Time (ISO):', isoString);

        messageService.success('Appointment successfully scheduled!');
    };

    const validateDate = (_: unknown, value: Dayjs | null) => {
        const now = dayjs();
        const oneYearLater = now.add(1, 'year');

        if (!value) {
            return Promise.reject(new Error('Please select a date!'));
        }

        if (value.isBefore(now, 'day')) {
            return Promise.reject(new Error('The selected date cannot be in the past!'));
        }

        if (value.isAfter(oneYearLater, 'day')) {
            return Promise.reject(new Error('The selected date must be within one year from now!'));
        }

        return Promise.resolve();
    };

    const validateTime = (_: unknown, value: Dayjs | null) => {
        const now = dayjs();
        const selectedDate = form.getFieldValue('date') as Dayjs | undefined;

        if (!selectedDate) {
            return Promise.reject(new Error('Please select a date first!'));
        }

        if (!value) {
            return Promise.reject(new Error('Please select a time!'));
        }

        const fullSelectedDate = selectedDate
            .clone()
            .set('hour', value.hour())
            .set('minute', value.minute())
            .set('second', 0);

        if (fullSelectedDate.isBefore(now)) {
            return Promise.reject(new Error('The selected time cannot be in the past!'));
        }

        return Promise.resolve();
    };

    return (
        <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            style={{maxWidth: 400, margin: '0 auto'}}
        >
            <Form.Item
                label="Choose Appointment Date"
                name="date"
                rules={[{required: true, validator: validateDate}]}
            >
                <DatePicker style={{width: '100%'}}/>
            </Form.Item>
            <Form.Item
                label="Choose Appointment Time"
                name="time"
                rules={[{required: true, validator: validateTime}]}
            >
                <TimePicker style={{width: '100%'}} format="HH:mm"/>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" style={{width: '100%'}}>
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};

export default AppointmentForm;
