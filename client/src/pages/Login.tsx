import React, {useEffect, useState, FormEvent} from "react";
import {AuthContext, IAuthContext, useAuthContext} from "../context/context";
import {Link, useNavigate} from "react-router-dom";
import {Button, Checkbox, Form, Input} from "antd";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import "./pages.scss";

const Login = () => {
    const {messageService, axiosAPI, setIsAuth, setCurrent}: IAuthContext =
        useAuthContext();
    const navigate = useNavigate();

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

    const onFinish = (values: any) => {
        const user = {username: values.username, password: values.password};
        if (!user.password || !user.username) {
            return;
        }
        axiosAPI
            .login(user)
            .then((response: any) => {
                console.log(response);
                messageService.open({
                    type: "success",
                    content: "Success",
                });
                setIsAuth(true);
            })
            .catch((error: any) => {
                messageService.open({
                    type: "error",
                    content: error.response.data.message,
                });
                console.log(error);
            });
    };

    return (
        <Form
            name="normal_login"
            className="login-form"
            initialValues={{remember: true}}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
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
                <Button type="primary" htmlType="submit" className="login-form-button">
                    Log in
                </Button>
                Or <Link to="/registration">register now!</Link>
            </Form.Item>
        </Form>
    );
};

export default Login;
