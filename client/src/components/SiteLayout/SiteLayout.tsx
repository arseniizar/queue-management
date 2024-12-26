import React, {ReactNode} from 'react'
import {Layout, Switch} from 'antd';
import {MoonOutlined, SunOutlined} from "@ant-design/icons";

const {Header, Content, Footer} = Layout;

interface siteLayoutProp {
    pages: ReactNode,
    isDarkMode: boolean,
    toggleTheme: () => void,
    className?: string
}

const SiteLayout: React.FC<siteLayoutProp> = ({pages, isDarkMode, toggleTheme, className}) => {

    return (
        <Layout className={`site-layout ${className}`}>
            <Header className="site-layout-background">
                <Switch
                    unCheckedChildren={<SunOutlined/>}
                    checkedChildren={<MoonOutlined/>}
                    defaultChecked={isDarkMode}
                    onClick={toggleTheme}
                />
            </Header>
            <Content className='layoutContent'>
                {pages}
            </Content>
            <Footer className='layoutFooter'>Ant Design ©2018 Created by Ant UED</Footer>
        </Layout>
    )
}

export default SiteLayout