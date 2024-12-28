import React, {useEffect, useState, useCallback} from "react";
import {Button} from "antd";
import {CloseOutlined, CheckOutlined, DeleteOutlined} from "@ant-design/icons";
import {QueueClient} from "../../interfaces";
import {IAuthContext, useAuthContext} from "../../context/context";

interface ClientActionsProps {
    client: QueueClient;
    onApprove: (client: QueueClient) => void;
    onCancel: (client: QueueClient) => void;
    onDelete: (client: QueueClient) => void;
    refreshTrigger: number;
}

const ClientActions: React.FC<ClientActionsProps> = ({client, onApprove, onCancel, onDelete, refreshTrigger}) => {
    const {axiosAPI}: IAuthContext = useAuthContext();
    const [isApproved, setIsApproved] = useState<boolean>(false);
    const [isCanceled, setIsCanceled] = useState<boolean>(false);

    const debounce = (func: (...args: any[]) => void, delay: number) => {
        let timeoutId: NodeJS.Timeout | null = null;

        return (...args: any[]) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    const fetchClientStatus = useCallback(
        debounce((username: string) => {
            axiosAPI.getUser(username).then((foundClient) => {
                setIsApproved(foundClient.approved);
                setIsCanceled(foundClient.cancelled);
            });
        }, 300),
        []
    );

    useEffect(() => {
        fetchClientStatus(client.username);
    }, [refreshTrigger, client.username, fetchClientStatus]);

    return (
        <>
            <Button
                type="text"
                title="Approve user"
                disabled={isApproved}
                onClick={() => onApprove(client)}
            >
                <CheckOutlined/>
            </Button>
            <Button
                danger
                type="text"
                title="Cancel user"
                disabled={isCanceled}
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
