import React, {useCallback, useEffect, useState} from "react";
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

const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

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
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    const debouncedFetchData = useCallback(
        debounce(async (queueId: string) => {
            setLoading(true);
            try {
                await getQueueData(queueId);
            } catch (error) {
                messageService.open({type: "error", content: "Failed to load queue data"});
            } finally {
                setLoading(false);
            }
        }, 300),
        [getQueueData]
    );

    useEffect(() => {
        const queueId = searchParams.get("queue");
        if (!queueId) {
            messageService.open({type: "error", content: "Queue not found"});
            navigate(routerPaths.queues);
            return;
        }

        debouncedFetchData(queueId);
    }, [searchParams, debouncedFetchData, refreshTrigger]);

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

    const deletePlace = useCallback(
        debounce(async (place: QueuePlace) => {
            try {
                await axiosAPI.deletePlace({userId: place.userId, queueId: place.queueId});
                messageService.open({type: "success", content: "Place deleted!"});
                setRefreshTrigger((prev) => prev + 1);
            } catch (error: any) {
                messageService.open({
                    type: "error",
                    content: error.response?.data?.message || "Failed to delete place.",
                });
            }
        }, 300),
        [axiosAPI]
    );

    const approveClient = useCallback(
        debounce(async (client: QueueClient) => {
            try {
                await axiosAPI.approveClient(client.userId, client.queueId);
                messageService.open({type: "success", content: "Client approved!"});
                setRefreshTrigger((prev) => prev + 1);
            } catch (error) {
                messageService.open({type: "error", content: "Failed to approve client."});
            }
        }, 300),
        [axiosAPI]
    );

    const cancelClient = useCallback(
        debounce(async (client: QueueClient) => {
            try {
                await axiosAPI.cancelClient(client.userId, client.queueId);
                messageService.open({type: "success", content: "Client canceled!"});
                setRefreshTrigger((prev) => prev + 1);
            } catch (error) {
                messageService.open({type: "error", content: "Failed to cancel client."});
            }
        }, 300),
        [axiosAPI]
    );

    const deleteClient = useCallback(
        debounce(async (client: QueueClient) => {
            try {
                await axiosAPI.deleteClient({userId: client.userId, queueId: client.queueId});
                messageService.open({type: "success", content: "Client deleted!"});
                setRefreshTrigger((prev) => prev + 1);
            } catch (error: any) {
                messageService.open({
                    type: "error",
                    content: error.response?.data?.message || "Failed to delete client.",
                });
            }
        }, 300),
        [axiosAPI]
    );

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
                    ? `${appointment.time} | ${place?.username || "Unknown place"}`
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
                    refreshTrigger={refreshTrigger}
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
