import * as React from 'react';
import {IAuthContext, useAuthContext} from "../context/context";

type Props = {
    children: React.ReactNode;
};
export const EmployeeRoute: React.FC<Props> = ({children}) => {

    return (
        <div>
            {children}
        </div>
    );
};