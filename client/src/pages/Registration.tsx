import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./pages.scss";
import { Button, Checkbox, Form, Input, Select } from "antd";
import {IAuthContext, useAuthContext} from "../context/context";

const { Option } = Select;

const Registration = () => {
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phonePrefix, setPhonePrefix] = useState<string>("+380");
  const [agreement, setAgreement] = useState<boolean>(false);
  const { messageService, axiosAPI, setCurrent } = useAuthContext();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    setCurrent("reg");
  }, []);

  const onFinish = (values: any) => {
    const user = {
      username: values.username,
      email: values.email,
      password: values.password,
      phone,
    };
    if (!user.email || !user.password || !phone || !user.email) {
      return;
    }
    axiosAPI
      .registration(user)
      .then((response: any) => {
        console.log(response);
        messageService.open({
          type: "success",
          content: "Success!",
        });
        navigate("/login");
      })
      .catch((error: any) => {
        console.log(error);
        messageService.open({
          type: "error",
          content: error.response?.data?.message,
        });
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log(errorInfo);
    messageService.open({
      type: "error",
      content: "Some field is empty",
    });
  };

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        onChange={(e) => setPhonePrefix("+".concat(e))}
        style={{ width: 70 }}
      >
        <Option value="380">+380</Option>
        <Option value="04">+04</Option>
        <Option value="05">+05</Option>
      </Select>
    </Form.Item>
  );

  function isButtonDisabled() {
    return !agreement || !password.length;
  }

  return (
    <Form
      form={form}
      className="register-form"
      name="register"
      onFinish={onFinish}
      initialValues={{
        prefix: "+380",
      }}
      onFinishFailed={onFinishFailed}
      scrollToFirstError
    >
      <Form.Item
        name="email"
        rules={[
          {
            type: "email",
            message: "The input is not valid E-mail!",
          },
          {
            required: true,
            message: "Please input your E-mail!",
          },
        ]}
      >
        <Input placeholder="Email" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: "Please input your password!",
          },
        ]}
        hasFeedback
      >
        <Input.Password
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Item>

      <Form.Item
        name="confirm"
        dependencies={["password"]}
        hasFeedback
        rules={[
          {
            required: true,
            message: "Please confirm your password!",
          },
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
        <Input.Password placeholder="Confirm your password" />
      </Form.Item>

      <Form.Item
        name="username"
        tooltip="What do you want others to call you?"
        rules={[
          {
            required: true,
            message: "Please input your username!",
            whitespace: true,
          },
        ]}
      >
        <Input placeholder="Username" />
      </Form.Item>

      <Form.Item
        name="phone"
        rules={[{ required: true, message: "Please input your phone number!" }]}
      >
        <Input
          placeholder="Phone number"
          onChange={(e) => setPhone(phonePrefix.concat(e.target.value))}
          addonBefore={prefixSelector}
          style={{ width: "100%" }}
        />
      </Form.Item>

      <Form.Item
        name="agreement"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value
                ? Promise.resolve()
                : Promise.reject(new Error("Should accept agreement")),
          },
        ]}
      >
        <Checkbox
          value={agreement}
          onChange={(e) => setAgreement(e.target.checked)}
        >
          I have read the <a href="">agreement</a>
        </Checkbox>
      </Form.Item>
      <Form.Item>
        <Button disabled={isButtonDisabled()} type="primary" htmlType="submit">
          Register
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Registration;
