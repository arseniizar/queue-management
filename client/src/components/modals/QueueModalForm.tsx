import { Form, Input, Modal } from "antd";
import React from "react";
import {IAuthContext, useAuthContext} from "../../context/context";

interface UseResetFormOnCloseModal {
  form: any;
  open: any;
}

interface ModalFormProps {
  open: boolean;
  onCancel: () => void;
  useResetFormOnCloseModal: ({ form, open }: UseResetFormOnCloseModal) => void;
}

const QueueModalForm: React.FC<ModalFormProps> = ({
  open,
  onCancel,
  useResetFormOnCloseModal,
}) => {
  const { axiosAPI, getQueues, messageService } = useAuthContext();
  const [form] = Form.useForm();

  useResetFormOnCloseModal({
    form,
    open,
  });

  const onOk = () => {
    form.submit();
  };

  const onFinish = (values: any) => {
    console.log(values);
    axiosAPI
      .createQueue(values.name)
      .then((response: any) => {
        console.log(response);
        getQueues();
        messageService.open({
          type: "success",
          content: "Queue created",
        });
      })
      .catch((error: any) => {
        console.log(error);
        messageService.open({
          type: "error",
          content: error.response?.data?.message,
        });
      });
  };

  return (
    <Modal title="Create Queue" open={open} onOk={onOk} onCancel={onCancel}>
      <Form form={form} layout="vertical" name="queueForm" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Name of the Queue"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QueueModalForm;
