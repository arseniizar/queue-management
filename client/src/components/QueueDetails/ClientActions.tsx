import React from "react";
import {Button} from "antd";
import {CloseOutlined, CheckOutlined, DeleteOutlined} from "@ant-design/icons";
import {QueueClient} from "../../interfaces";

interface ClientActionsProps {
    client: QueueClient;
    onApprove: (client: QueueClient) => void;
    onCancel: (client: QueueClient) => void;
    onDelete: (client: QueueClient) => void;
}

const ClientActions: React.FC<ClientActionsProps> = ({client, onApprove, onCancel, onDelete}) => {
    return (
        <>
            <Button
                type="text"
                title="Approve user"
                onClick={() => onApprove(client)}
            >
                <CheckOutlined/>
            </Button>
            <Button
                danger
                type="text"
                title="Cancel user"
                onClick={() => onCancel(client)}
            >
                <CloseOutlined/>
            </Button>
            <Button
                type="text"
                title="Delete user"
                onClick={() => onDelete(client)}
            >
                <DeleteOutlined/>
            </Button>
        </>
    );
};

export default ClientActions;
