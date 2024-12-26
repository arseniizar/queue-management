import React, { useEffect, useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import validator from "validator";
import {useAuthContext} from "../context/context";

const { Title } = Typography;

const Profile: React.FC = () => {
  const { setCurrent, axiosAPI, userData, messageService, setUserData } =
    useAuthContext();
  const [email, setEmail] = useState<string>(userData.email);
  const [phone, setPhone] = useState<string>(userData.phone);
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");

  useEffect(() => setCurrent("profile"), []);

  async function dateChangeSubmit() {
    const isEmailValid = validator.isEmail(email);
    const isPhoneValid = validator.isMobilePhone(phone);
    if (!isEmailValid || !isPhoneValid) {
      messageService.open({
        type: "error",
        content: "Email or phone is not valid",
      });
      return;
    }
    const changedUser = { email, phone, password, username: userData.username };
    if (
      userData.phone === changedUser.phone &&
      userData.email === changedUser.email
    ) {
      messageService.open({
        type: "error",
        content: "Nothing changed",
      });
      return;
    }
    axiosAPI
      .changeData(changedUser)
      .then((response: any) => {
        console.log(response);
        setUserData(response.data);
        messageService.open({
          type: "success",
          content: "Success!",
        });
      })
      .catch((error: any) => {
        console.log(error);
        messageService.open({
          type: "error",
          content: error.response.data.message,
        });
      });
  }

  function isButtonDisabled() {
    if (!password.length || !passwordConfirm.length) return true;
    if (passwordConfirm !== password) return true;
    if (passwordConfirm === password) return false;
  }

  return (
    <div className="profileForm">
      <Title className="profileTitle" level={2}>
        Change user data
      </Title>
      <Form layout="vertical" onSubmitCapture={dateChangeSubmit}>
        <Form.Item label="Username">
          <Input value={userData.username} disabled={true} />
        </Form.Item>
        <Form.Item label="Phone">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={`previous: ${userData.phone}`}
          />
        </Form.Item>
        <Form.Item label="Email">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`previous: ${userData.email}`}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
          label="Password"
        >
          <Input.Password onChange={(e) => setPassword(e.target.value)} />
        </Form.Item>
        <Form.Item
          name="password-confirm"
          rules={[{ required: true, message: "Please confirm your password!" }]}
          label="Confirm Password"
        >
          <Input.Password
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </Form.Item>
        <Form.Item className="submitButtonContainer">
          <Button
            type="primary"
            htmlType="submit"
            disabled={isButtonDisabled()}
          >
            Submit Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Profile;
