import * as React from 'react';
import {IAuthContext, useAuthContext} from "../context/context";
import Title from "antd/es/typography/Title";

type Props = {
    children: React.ReactNode;
};
export const EmployeeRoute: React.FC<Props> = ({children}) => {
    const {isEmployee}: IAuthContext = useAuthContext();

    return (
        isEmployee ?
            <div>
                {children}
            </div> : <Title level={3}>You are not an employee</Title>
    );
};