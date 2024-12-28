import React, {ReactNode, useEffect, useState} from 'react'
import {Layout, Switch, Typography} from 'antd';
import {MoonOutlined, SunOutlined} from "@ant-design/icons";
import LogoSVG from "../svgs/LogoSVG";
import {useLocation} from "react-router";
import {IAuthContext, useAuthContext} from "../../context/context";

const {Header, Content, Footer} = Layout;

interface siteLayoutProp {
    pages: ReactNode,
    isDarkMode: boolean,
    toggleTheme: () => void,
    className?: string
}

const SiteLayout: React.FC<siteLayoutProp> = ({pages, isDarkMode, toggleTheme, className}) => {
    const [title, setTitle] = useState<string>('');

    const {isLoading}: IAuthContext = useAuthContext();

    const location = useLocation();

    useEffect(() => {
        const formatTitle = (pathname: string) => {
            const parts = pathname.split('/')[1];
            if (!parts) return 'Menu';
            return parts
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };
        if (!isLoading) setTitle(formatTitle(location.pathname));
    }, [location, isLoading]);

    return (
        <Layout className={`site-layout ${className}`}>
            {isLoading ?
                <Header className="site-layout-background"/>
                :
                <Header className="site-layout-background">
                    <div className='logo-container'>
                        <LogoSVG/>
                    </div>
                    <div className="header-title">
                        <Typography.Title level={2} style={{marginBottom: 20, color: 'white'}}>
                            {title}
                        </Typography.Title>
                    </div>
                    <div className='header-buttons'>
                        {/*<Switch*/}
                        {/*    unCheckedChildren={<SunOutlined/>}*/}
                        {/*    checkedChildren={<MoonOutlined/>}*/}
                        {/*    defaultChecked={isDarkMode}*/}
                        {/*    onClick={toggleTheme}*/}
                        {/*/>*/}
                    </div>
                </Header>
            }
            <Content className='layoutContent'>
                {pages}
            </Content>
            <Footer className='layoutFooter'>Ant Design ©2018 Created by Ant UED</Footer>
        </Layout>
    )
}

export default SiteLayout