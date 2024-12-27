import React, {useEffect} from "react";
import {IAuthContext, useAuthContext} from "../context/context";
import WelcomeComponent from "../components/Welcome/WelcomeComponent";

const Menu = () => {
    const {setCurrent}: IAuthContext = useAuthContext();
    useEffect(() => {
        setCurrent("menu");
    }, []);

    return <div>
        <WelcomeComponent/>
    </div>;
};

export default Menu;
