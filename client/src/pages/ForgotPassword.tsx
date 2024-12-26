import React, {useState} from "react";
import {MailOutlined} from "@ant-design/icons";
import {Button, Form, Input} from "antd";
import {useAuthContext} from "../context/context";
import {useNavigate} from "react-router-dom";

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [emailConfirmation, setEmailConfirmation] = useState<string>("");
    const {axiosAPI, messageService} = useAuthContext();
    const navigate = useNavigate();

    const handleReset = async () => {
        if (!email || !emailConfirmation) {
            messageService.open({
                type: "error",
                content: "Some field is empty.",
            });
            return;
        }

        if (email !== emailConfirmation) {
            messageService.open({
                type: "error",
                content: "The two emails do not match!",
            });
            return;
        }

        try {
            await axiosAPI.forgotPassword(email);
            messageService.open({
                type: "success",
                content: "The email with the reset link has been sent!",
            });
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error: any) {
            console.error(error);

            const rawMessage = error.response?.data?.message;
            let errorMessage = "Failed to send the reset email.";

            if (Array.isArray(rawMessage)) {
                errorMessage = rawMessage.join(", ");
            } else if (typeof rawMessage === "string") {
                errorMessage = rawMessage.replace(/([a-z])([A-Z])/g, "$1 $2");
            }

            messageService.open({
                type: "error",
                content: errorMessage,
            });
        }
    };

    return (
        <Form
            name="forgot_password"
            className="login-form"
            initialValues={{remember: true}}
            onFinish={handleReset}
        >
            <Form.Item
                name="email"
                rules={[
                    {required: true, message: "Please input your Email!"},
                    {type: "email", message: "Please enter a valid Email!"},
                ]}
            >
                <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    prefix={<MailOutlined className="site-form-item-icon"/>}
                    placeholder="Email"
                />
            </Form.Item>
            <Form.Item
                name="email_confirmation"
                rules={[
                    {required: true, message: "Please confirm your Email!"},
                    () => ({
                        validator(_, value) {
                            if (!value || email === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(
                                new Error("The two emails do not match!")
                            );
                        },
                    }),
                ]}
            >
                <Input
                    value={emailConfirmation}
                    onChange={(e) => setEmailConfirmation(e.target.value)}
                    prefix={<MailOutlined className="site-form-item-icon"/>}
                    placeholder="Confirm your email"
                />
            </Form.Item>
            <Form.Item>
                <Button
                    disabled={!email || !emailConfirmation || email !== emailConfirmation}
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

export default ForgotPassword;
