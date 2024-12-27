import React, {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {Button, Form, Typography} from "antd";
import {UserAddOutlined, PlayCircleOutlined} from "@ant-design/icons";
import ClientAdditionModalForm from "../components/ClientAdditionModalForm/ClientAdditionModalForm";
import PlaceCreationModalForm from "../components/PlaceCreationModalForm/PlaceCreationModalForm";
import PlaceAdditionModalForm from "../components/PlaceAdditionModalForm/PlaceAdditionModalForm";
import {useAuthContext} from "../context/context";
import {routerPaths} from "../router/router";
import {DataTable} from "../components/QueueDetails/DataTable";
import {Appointment, QueueClient, QueuePlace} from "../interfaces";
import {PlaceActions} from "../components/QueueDetails/PlaceActions";
import {ColumnsType} from "antd/es/table";
import ClientActions from "../components/QueueDetails/ClientActions";
import StepInQueueModalForm from "../components/StepInQueueModalForm/StepInQueueModalForm";

const QueueDetails: React.FC = () => {
    const {setCurrent, axiosAPI, queueData, getQueueData, messageService, userData} = useAuthContext();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState<boolean>(false);
    const [openClientModal, setOpenClientModal] = useState<boolean>(false);
    const [openPlaceCreationModal, setOpenPlaceCreationModal] = useState<boolean>(false);
    const [openPlaceAdditionModal, setOpenPlaceAdditionModal] = useState<boolean>(false);
    const [openStepInQueueModal, setOpenStepInQueueModal] = useState<boolean>(false);
    const [placesData, setPlacesData] = useState<QueuePlace[]>([]);
    const [clientsData, setClientsData] = useState<QueueClient[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const queueId = searchParams.get("queue");
        if (!queueId) {
            messageService.open({type: "error", content: "Queue not found"});
            navigate(routerPaths.queues);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                await getQueueData(queueId);
            } catch (error) {
                messageService.open({type: "error", content: "Failed to load queue data"});
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams, getQueueData]);

    useEffect(() => {
        if (queueData) {
            setPlacesData(
                queueData.places?.map((place: QueuePlace) => ({
                    key: place.userId,
                    ...place,
                })) || []
            );

            setClientsData(
                queueData.clients?.map((client: QueueClient) => ({
                    key: client.userId,
                    ...client,
                })) || []
            );
        }
    }, [queueData]);

    const deletePlace = async (place: QueuePlace) => {
        try {
            await axiosAPI.deletePlace({userId: place.userId, queueId: place.queueId});
            messageService.open({type: "success", content: "Place deleted!"});
            await getQueueData(place.queueId);
        } catch (error: any) {
            messageService.open({
                type: "error",
                content: error.response?.data?.message || "Failed to delete place.",
            });
        }
    };

    const approveClient = async (client: QueueClient) => {
        try {
            await axiosAPI.approveClient(client.userId, client.queueId);
            messageService.open({type: "success", content: "Client approved!"});
            await getQueueData(client.queueId);
        } catch (error) {
            messageService.open({type: "error", content: "Failed to approve client."});
        }
    };

    const cancelClient = async (client: QueueClient) => {
        try {
            await axiosAPI.cancelClient(client.userId, client.queueId);
            messageService.open({type: "success", content: "Client canceled!"});
            await getQueueData(client.queueId);
        } catch (error) {
            messageService.open({type: "error", content: "Failed to cancel client."});
        }
    };

    const deleteClient = async (client: QueueClient) => {
        try {
            await getQueueData(client.queueId);
            const updatedClient: QueueClient | undefined = queueData.clients.find(
                (c: QueueClient) => c.username === client.username
            );
            if (!updatedClient || !updatedClient.userId) {
                messageService.open({
                    type: "error",
                    content: "Client not found or invalid.",
                });
                return;
            }
            const payload = {userId: updatedClient.userId, queueId: updatedClient.queueId};
            await axiosAPI.deleteClient(payload);
            messageService.open({type: "success", content: "Client deleted!"});
            await getQueueData(updatedClient.queueId);
        } catch (error: any) {
            console.error("Failed to delete client:", error.response || error);

            messageService.open({
                type: "error",
                content: error.response?.data?.message || "Failed to delete client.",
            });
        }
    };

    const placeColumns: ColumnsType<QueuePlace> = [
        {title: "Username", dataIndex: "username", key: "username"},
        {title: "Email", dataIndex: "email", key: "email"},
        {title: "Phone", dataIndex: "phone", key: "phone"},
        {
            title: "Actions",
            key: "actions",
            render: (_: any, place: QueuePlace) => <PlaceActions place={place} onDelete={deletePlace}/>,
        },
    ];

    const clientColumns: ColumnsType<QueueClient> = [
        {title: "Username", dataIndex: "username", key: "username"},
        {title: "Email", dataIndex: "email", key: "email"},
        {title: "Phone", dataIndex: "phone", key: "phone"},
        {
            title: "Appointment",
            key: "appointment",
            dataIndex: "appointment",
            render: (appointment: Appointment | undefined) => {
                if (!appointment) {
                    return "No appointment";
                }

                const place = placesData.find(
                    (place) => place.userId === appointment.place
                );

                return appointment.time
                    ? `${appointment.time} - ${place?.username || "Unknown place"}`
                    : "No appointment";
            },
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, client: QueueClient) => (
                <ClientActions
                    client={client}
                    onApprove={approveClient}
                    onCancel={cancelClient}
                    onDelete={deleteClient}
                />
            ),
        },
    ];

    return (
        <div className="queueDetailsContainer">
            <Form.Provider
                onFormFinish={(name) => {
                    if (name === "placeCreationForm") setOpenPlaceCreationModal(false);
                    if (name === "placeAdditionForm") setOpenPlaceAdditionModal(false);
                    if (name === "clientForm") setOpenClientModal(false);
                }}
            >
                <div className="placeTableContainer">
                    <Typography.Title level={4}>Place table</Typography.Title>
                    <div className="tableButtonsContainer">
                        <Button shape="round" onClick={() => setOpenPlaceCreationModal(true)}>
                            <UserAddOutlined/> Create Place
                        </Button>
                        <Button shape="round" onClick={() => setOpenPlaceAdditionModal(true)}>
                            <UserAddOutlined/> Add Place
                        </Button>
                    </div>
                    <DataTable dataSource={placesData} loading={loading} columns={placeColumns}/>
                </div>
                <div className="clientTableContainer">
                    <Typography.Title level={4}>Client table</Typography.Title>
                    <div className="tableButtonsContainer">
                        <Button disabled={!placesData.length} shape="round" onClick={() => setOpenClientModal(true)}>
                            <UserAddOutlined/> Add client
                        </Button>

                        <Button
                            disabled={!placesData.length}
                            shape="round"
                            onClick={() => setOpenStepInQueueModal(true)}
                        >
                            <PlayCircleOutlined/> Step in queue
                        </Button>
                    </div>
                    <DataTable dataSource={clientsData} loading={loading} columns={clientColumns}/>
                </div>
                <ClientAdditionModalForm
                    open={openClientModal}
                    onCancel={() => setOpenClientModal(false)}
                    useResetFormOnCloseModal={() => {
                    }}
                />
                <PlaceCreationModalForm
                    open={openPlaceCreationModal}
                    onCancel={() => setOpenPlaceCreationModal(false)}
                    useResetFormOnCloseModal={() => {
                    }}
                />
                <PlaceAdditionModalForm
                    open={openPlaceAdditionModal}
                    onCancel={() => setOpenPlaceAdditionModal(false)}
                    useResetFormOnCloseModal={() => {
                    }}
                />
                <StepInQueueModalForm
                    open={openStepInQueueModal}
                    onCancel={() => setOpenStepInQueueModal(false)}
                    useResetFormOnCloseModal={() => {
                    }}
                    username={userData?.username}
                />
            </Form.Provider>
        </div>
    );
};

export default QueueDetails;
