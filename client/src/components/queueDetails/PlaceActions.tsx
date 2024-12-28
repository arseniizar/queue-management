import React from "react";
import {Button} from "antd";
import {DeleteOutlined} from "@ant-design/icons";

interface PlaceActionsProps {
    place: any;
    onDelete: (place: any) => void;
}

export const PlaceActions: React.FC<PlaceActionsProps> = ({place, onDelete}) => (
    <Button type="text" title="Delete user" onClick={() => onDelete(place)}>
        <DeleteOutlined/>
    </Button>
);
