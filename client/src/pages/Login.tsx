import React, {useEffect, useState, FormEvent} from "react";
import {AuthContext, IAuthContext, useAuthContext} from "../context/context";
import {Link, useNavigate} from "react-router-dom";
import {Button, Checkbox, Form, Input, Typography} from "antd";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import "./pages.scss";
import SubmitButton from "../components/SubmitButton/SubmitButton";

const Login = () => {
    const {messageService, axiosAPI, setIsAuth, setCurrent, authProfileGetVerify}: IAuthContext =
        useAuthContext();
    const [form] = Form.useForm();

    useEffect(() => {
        setCurrent("login");
    }, []);

    const onFinishFailed = (errorInfo: any) => {
        console.log(errorInfo);
        messageService.open({
            type: "error",
            content: "Some field is empty",
        });
    };

    const onFinish = async (values: any) => {
        const user = {username: values.username, password: values.password};
        if (!user.password || !user.username) return;

        try {
            const response = await axiosAPI.login(user);
            localStorage.setItem("AuthToken", response.accessToken);
            await authProfileGetVerify();
            messageService.open({
                type: "success",
                content: "Login successful",
            });
        } catch (error: any) {
            messageService.open({
                type: "error",
                content: "Login failed",
            });
        }
    };

    return (
        <Form
            name="normal_login"
            className="login-form"
            initialValues={{remember: true}}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            form={form}
        >
            <Form.Item
                name="username"
                rules={[{required: true, message: "Please input your Username!"}]}
            >
                <Input
                    prefix={<UserOutlined className="site-form-item-icon"/>}
                    placeholder="Username"
                />
            </Form.Item>
            <Form.Item
                name="password"
                rules={[{required: true, message: "Please input your Password!"}]}
            >
                <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon"/>}
                    type="password"
                    placeholder="Password"
                />
            </Form.Item>
            <Form.Item>
                <Link to="/forgot-password">Forgot password</Link>
            </Form.Item>
            <Form.Item>
                <SubmitButton form={form}>Log in</SubmitButton>
                Or <Link to="/registration">register now!</Link>
            </Form.Item>
        </Form>
    );
};

export default Login;
