import React from "react";
import {Layout, Typography, Row, Col, Divider, Card, Button} from "antd";
import {PlayCircleOutlined} from "@ant-design/icons";

const {Content} = Layout;
const {Title, Paragraph} = Typography;

const Guide: React.FC = () => {
    return (
        <Layout style={{backgroundColor: "#f0f2f5", minHeight: "100vh"}}>
            <Content style={{padding: "20px 50px"}}>
                <Card style={{maxWidth: 1200, margin: "0 auto", padding: "20px"}}>
                    <Title level={2} style={{textAlign: "center"}}>
                        Welcome to the Queue Management System
                    </Title>
                    <Paragraph style={{textAlign: "center", marginBottom: "40px"}}>
                        Learn how to efficiently manage queues, add clients, and set appointments. Follow this guide to
                        get started!
                    </Paragraph>

                    <Divider>Steps to Get Started</Divider>

                    <Row gutter={[16, 16]} justify="center">
                        <Col xs={24} sm={12} md={8}>
                            <Card hoverable>
                                <Title level={4}>Step 1: Create a Queue</Title>
                                <Paragraph>
                                    Navigate to the "Queues" section, and click "Create Queue" to set up a new queue.
                                </Paragraph>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card hoverable>
                                <Title level={4}>Step 2: Add Places</Title>
                                <Paragraph>
                                    Add places to your queue for better organization. Use the "Add Place" button in the
                                    queue details.
                                </Paragraph>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card hoverable>
                                <Title level={4}>Step 3: Step Clients In</Title>
                                <Paragraph>
                                    Use the "Step In Queue" button to add clients with their desired appointments.
                                </Paragraph>
                            </Card>
                        </Col>
                    </Row>

                    <Divider>Video Tutorial</Divider>

                    <div style={{textAlign: "center", marginBottom: "40px"}}>
                        <div style={{marginBottom: "20px"}}>
                            <PlayCircleOutlined style={{fontSize: "60px", color: "#1890ff"}}/>
                        </div>
                        <Typography.Paragraph>
                            Watch the tutorial video below to see how to use the Queue Management System in action.
                        </Typography.Paragraph>
                        <div
                            style={{
                                maxWidth: "800px",
                                margin: "0 auto",
                                position: "relative",
                                paddingTop: "56.25%",
                                backgroundColor: "#e8e8e8",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            }}
                        >
                            <video
                                src="http://localhost:1234/assets/guide.mp4"
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: "8px",
                                    border: "none",
                                }}
                                onError={() => {
                                    console.error("Iframe failed to load.");
                                    alert("The video could not be loaded. Please try again later.");
                                }}
                            >
                            </video>
                        </div>
                    </div>


                    <Divider>Key Features</Divider>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Card>
                                <Title level={4}>Appointment Scheduling</Title>
                                <Paragraph>
                                    Schedule appointments effortlessly with a simple, intuitive interface.
                                </Paragraph>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Card>
                                <Title level={4}>Real-time Updates</Title>
                                <Paragraph>
                                    Stay updated with real-time notifications for changes in queues and schedules.
                                </Paragraph>
                            </Card>
                        </Col>
                    </Row>

                    <Divider>Get Started</Divider>

                    <div style={{textAlign: "center"}}>
                        <Button type="primary" size="large" style={{borderRadius: "5px"}}>
                            Go to Dashboard
                        </Button>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
};

export default Guide;
