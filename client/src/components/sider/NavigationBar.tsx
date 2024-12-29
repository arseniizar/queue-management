import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
    FileOutlined,
    UserOutlined,
    TableOutlined,
    InfoOutlined,
    StarOutlined,
    PoweroffOutlined,
    KeyOutlined,
    HddOutlined,
    AppstoreOutlined, ScheduleOutlined,
} from "@ant-design/icons";
import {MenuProps} from "antd";
import {Layout, Menu} from "antd";
import {IAuthContext, useAuthContext} from "../../context/context";
import {routerPaths} from "../../router/router";

const {Sider} = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
    label: React.ReactNode,
    key?: React.Key | null,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: "group"
): MenuItem {
    return {
        label,
        key,
        icon,
        children,
        type,
    } as MenuItem;
}

const NavigationBar: React.FC = () => {
    const {
        isAuth,
        setIsAuth,
        current,
        setCurrent,
        axiosAPI,
        authProfileGetVerify,
        setUserData,
        isEmployee,
        setIsEmployee
    }: IAuthContext =
        useAuthContext();
    const [collapsed, setCollapsed] = useState(window.innerWidth <= 800);
    const [siderItems, setSiderItems] = useState<MenuItem[] | undefined>(
        undefined
    );

    const handleResize = () => {
        setCollapsed(window.innerWidth <= 800);
    };

    const logout = async () => {
        try {
            await axiosAPI.logout();
            localStorage.removeItem("AuthToken");
            setIsAuth(false);
            setUserData(undefined);
            console.log("Successfully logged out.");
        } catch (error) {
            console.error("Error during logout:", error);
        } finally {
            await authProfileGetVerify();
        }
    };

    useEffect(() => {
        axiosAPI.isEmployee().then(() => setIsEmployee(true)).catch(() => setIsEmployee(false));
    }, [isAuth]);

    useEffect(() => {
        const items: MenuItem[] = [
            isAuth
                ? getItem("Main", "sub1", <FileOutlined/>, [
                    getItem(<Link to="/menu">Menu</Link>, "menu", <StarOutlined/>),
                    getItem(
                        <Link to="/queues">Queues</Link>,
                        "queues",
                        <TableOutlined/>
                    ),
                    getItem(
                        <Link to={routerPaths.guide}>Guide</Link>,
                        "guide",
                        <InfoOutlined/>
                    ),
                    getItem("Profile", "sub2", <UserOutlined/>, [
                        getItem(
                            <Link to="/profile">Info</Link>,
                            "profile",
                            <InfoOutlined/>
                        ),
                        isEmployee ?
                            getItem(
                                <Link to={routerPaths.schedule}>Schedule</Link>,
                                "schedule",
                                <ScheduleOutlined/>
                            ) : null,
                        getItem(
                            <Link to="/login" onClick={logout}>
                                Logout
                            </Link>,
                            "logout",
                            <PoweroffOutlined/>
                        ),
                    ]),
                ])
                : getItem("Navigation", "sub3", <AppstoreOutlined/>, [
                    getItem(<Link to="/login">Login</Link>, "login", <KeyOutlined/>),
                    getItem(
                        <Link to="/registration">Registration</Link>,
                        "reg",
                        <HddOutlined/>
                    ),
                ]),
        ];
        setSiderItems(items);
    }, [isAuth, isEmployee]);

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const onClick: MenuProps["onClick"] = (e) => {
        setCurrent(e.key);
    };

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
        >
            <Menu
                theme="dark"
                mode="inline"
                items={siderItems}
                onClick={onClick}
                selectedKeys={[current]}
            />
        </Sider>
    );
};

export default NavigationBar;
