import React, {useState} from "react";
import {Button, Form, Input, Typography} from "antd";
import {IAuthContext, useAuthContext} from "../context/context";
import {useNavigate, useSearchParams} from "react-router-dom";
import {LockOutlined} from "@ant-design/icons";

const {Title} = Typography;

const PasswordReset = () => {
    const [password, setPassword] = useState<string>("");
    const [passwordConfirm, setPasswordConfirm] = useState<string>("");
    const {axiosAPI, messageService} = useAuthContext();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const onFinish = (values: any) => {
        console.log("Success:", values);
        const token = searchParams.get("token");
        const data = {token, password};
        console.log(data);

        if (data.token === null) {
            messageService.open({
                type: "error",
                content: "Reset password link is invalid!",
            });
            return;
        }

        axiosAPI
            .resetPassword(data.token)
            .then((response: any) => {
                messageService.open({
                    type: "success",
                    content: "Your password has been changed!",
                });
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            })
            .catch((error: any) => {
                messageService.open({
                    type: "error",
                    content: error.response.data.message,
                });
                setTimeout(() => {
                    navigate("/login");
                }, 1000);
            });
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log("Failed:", errorInfo);
    };

    function isButtonDisabled() {
        if (!passwordConfirm.length || !password.length) {
            return true;
        } else {
            return false;
        }
    }

    return (
        <Form
            name="normal_login"
            className="login-form"
            initialValues={{remember: true}}
            onFinish={onFinish}
        >
            <Form.Item
                name="password"
                rules={[{required: true, message: "Please input your new password!"}]}
            >
                <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon"/>}
                    placeholder="New Password"
                    onChange={(e) => setPassword(e.target.value)}
                />
            </Form.Item>
            <Form.Item
                name="password-confirm"
                rules={[
                    {required: true, message: "Please confirm your new password!"},
                    () => ({
                        validator(_, value) {
                            if (!value || password === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(
                                new Error("The two passwords do not match!")
                            );
                        },
                    }),
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon"/>}
                    placeholder="Confirm your new password"
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                />
            </Form.Item>
            <Form.Item>
                <Button
                    disabled={isButtonDisabled()}
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                >
                    Reset Password
                </Button>
            </Form.Item>
        </Form>
    );
};

export default PasswordReset;
