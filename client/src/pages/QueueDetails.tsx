import React, {useEffect, useRef, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {Button, Form, FormInstance, Table, Typography} from "antd";
import type {TableProps} from "antd/es/table";
import Column from "antd/es/table/Column";
import {
    CloseOutlined,
    CheckOutlined,
    DeleteOutlined,
    UserAddOutlined,
    PlayCircleOutlined,
} from "@ant-design/icons";
import ClientAdditionModalForm from "../components/ClientAdditionModalForm/ClientAdditionModalForm";
import PlaceCreationModalForm from "../components/PlaceCreationModalForm/PlaceCreationModalForm";
import PlaceAdditionModalForm from "../components/PlaceAdditionModalForm/PlaceAdditionModalForm";
import {Appointment} from "../interfaces";
import {useAuthContext} from "../context/context";
import {routerPaths} from "../router/router";

interface DataType {
    key: React.Key;
    username: string;
    email: string;
    phone: string;
    userId: string;
    queueId: string;
    roles: string;
    appointment: Appointment | null;
}

const tableOnChange: TableProps<DataType>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
) => {
    console.log("params", pagination, filters, sorter, extra);
};

// reset form fields when modal is form, closed
const useResetFormOnCloseModal = ({
                                      form,
                                      open,
                                  }: {
    form: FormInstance;
    open: boolean;
}) => {
    const prevOpenRef = useRef<boolean>(open);
    useEffect(() => {
        prevOpenRef.current = open;
    }, [open]);
    const prevOpen = prevOpenRef.current;

    useEffect(() => {
        if (!open && prevOpen) {
            form.resetFields();
        }
    }, [form, prevOpen, open]);
};

const QueueDetails: React.FC = () => {
    const {
        setCurrent,
        axiosAPI,
        queueData,
        getQueueData,
        setQueueData,
        messageService,
    } = useAuthContext();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState<boolean>(false);
    const [openClientModal, setOpenClientModal] = useState<boolean>(false);
    const [openPlaceCreationModal, setOpenPlaceCreationModal] =
        useState<boolean>(false);
    const [openPlaceAdditionModal, setOpenPlaceAdditionModal] =
        useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        setCurrent("queue-details");
        const queueId = searchParams.get("queue");
        if (queueId) {
            getQueueData(queueId);
            setLoading(false);
        } else {
            messageService.open({
                type: "error",
                content: "Queue not found",
            });
            navigate(routerPaths.queues);
        }
    }, []);

    // Map queueData.places to DataType
    const placesData: DataType[] =
        queueData?.places?.map((place) => ({
            key: place._id,
            username: place.username,
            email: place.email,
            phone: place.phone,
            userId: place._id,
            queueId: queueData._id,
            roles: place.roles,
            appointment: null, // Assuming places don't have appointments
        })) || [];

    // Map queueData.clients to DataType
    const clientsData: DataType[] =
        queueData?.clients?.map((client) => ({
            key: client._id,
            username: client.username,
            email: client.email,
            phone: client.phone,
            userId: client._id,
            queueId: queueData._id,
            roles: client.roles,
            appointment: client.appointment || null,
        })) || [];

    const deletePlace = (place: DataType) => {
        const deletionData = {userId: place.userId, queueId: place.queueId};
        axiosAPI
            .deletePlace(deletionData)
            .then(() => {
                getQueueData(place.queueId);
                messageService.open({
                    type: "success",
                    content: "Place deleted!",
                });
            })
            .catch((error: any) => {
                messageService.open({
                    type: "error",
                    content: error.response?.data?.message,
                });
            });
    };

    return (
        <div className="queueDetailsContainer">
            <Form.Provider
                onFormFinish={(name) => {
                    if (name === "placeCreationForm") {
                        setOpenPlaceCreationModal(false);
                    }
                    if (name === "placeAdditionForm") {
                        setOpenPlaceAdditionModal(false);
                    }
                    if (name === "clientForm") {
                        setOpenClientModal(false);
                    }
                }}
            >
                <div className="placeTableContainer">
                    <Typography.Title level={4}>Place table</Typography.Title>
                    <div className="tableButtonsContainer">
                        <Button shape="round" onClick={() => setOpenPlaceCreationModal(true)}>
                            <UserAddOutlined/>
                            Create Place
                        </Button>
                        <Button shape="round" onClick={() => setOpenPlaceAdditionModal(true)}>
                            <UserAddOutlined/>
                            Add Place
                        </Button>
                    </div>
                    <Table
                        size="small"
                        pagination={{hideOnSinglePage: true}}
                        dataSource={placesData}
                        onChange={tableOnChange}
                        loading={loading}
                    >
                        <Column
                            title="Username"
                            key="Username"
                            render={(_: any, place: DataType) => <>{place.username}</>}
                        />
                        <Column
                            title="Email"
                            key="email"
                            render={(_: any, place: DataType) => <>{place.email}</>}
                        />
                        <Column
                            title="Phone"
                            key="phone"
                            render={(_: any, place: DataType) => <>{place.phone}</>}
                        />
                        <Column
                            title="Actions"
                            key="actions"
                            render={(_: any, place: DataType) => (
                                <>
                                    <Button
                                        type="text"
                                        title="Delete user"
                                        onClick={() => deletePlace(place)}
                                    >
                                        <DeleteOutlined/>
                                    </Button>
                                </>
                            )}
                        />
                    </Table>
                </div>
                <div className="clientTableContainer">
                    <Typography.Title level={4}>Client table</Typography.Title>
                    <div className="tableButtonsContainer">
                        <Button shape="round" onClick={() => setOpenClientModal(true)}>
                            <UserAddOutlined/>
                            Add client
                        </Button>
                        <Button shape="round">
                            <PlayCircleOutlined/>
                            Step in queue
                        </Button>
                    </div>
                    <Table
                        size="small"
                        pagination={{hideOnSinglePage: true}}
                        dataSource={clientsData}
                        onChange={tableOnChange}
                        loading={loading}
                    >
                        <Column
                            title="Username"
                            key="Username"
                            render={(_: any, client: DataType) => <>{client.username}</>}
                        />
                        <Column
                            title="Email"
                            key="email"
                            render={(_: any, client: DataType) => <>{client.email}</>}
                        />
                        <Column
                            title="Phone"
                            key="phone"
                            render={(_: any, client: DataType) => <>{client.phone}</>}
                        />
                        <Column
                            title="Appointment"
                            key="actions"
                            render={(_: any, client: DataType) =>
                                client.appointment ? (
                                    <React.Fragment>{client.appointment.time}</React.Fragment>
                                ) : null
                            }
                        />
                        <Column
                            title="Actions"
                            key="actions"
                            render={(_: any, client: DataType) => (
                                <>
                                    <Button danger type="text" title="Cancel user">
                                        <CloseOutlined/>
                                    </Button>
                                    <Button type="text" title="Approve user">
                                        <CheckOutlined/>
                                    </Button>
                                    <Button type="text" title="Delete user">
                                        <DeleteOutlined/>
                                    </Button>
                                </>
                            )}
                        />
                    </Table>
                    <ClientAdditionModalForm
                        open={openClientModal}
                        onCancel={() => setOpenClientModal(false)}
                        useResetFormOnCloseModal={useResetFormOnCloseModal}
                    />
                    <PlaceCreationModalForm
                        open={openPlaceCreationModal}
                        onCancel={() => setOpenPlaceCreationModal(false)}
                        useResetFormOnCloseModal={useResetFormOnCloseModal}
                    />
                    <PlaceAdditionModalForm
                        open={openPlaceAdditionModal}
                        onCancel={() => setOpenPlaceAdditionModal(false)}
                        useResetFormOnCloseModal={useResetFormOnCloseModal}
                    />
                </div>
            </Form.Provider>
        </div>
    );
};

export default QueueDetails;
