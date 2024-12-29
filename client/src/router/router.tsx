import {Navigate} from "react-router-dom";
import React from "react";
import Menu from "../pages/Menu";
import Login from "../pages/Login";
import Registration from "../pages/Registration";
import Profile from "../pages/Profile";
import PasswordReset from "../pages/PasswordReset";
import ForgotPassword from "../pages/ForgotPassword";
import Queues from "../pages/Queues";
import QueueDetails from "../pages/QueueDetails";
import Guide from "../pages/Guide";
import Schedule from "../pages/Schedule";

export const routerPaths = {
    menu: "/",
    profile: "/profile",
    queues: "/queues",
    queueDetails: "/queue-details",
    login: "/login",
    registration: "/registration",
    passwordReset: "/password-reset",
    forgotPassword: "/forgot-password",
    guide: "/guide",
    schedule: "/schedule",
};

export const privateRoutes = [
    {path: routerPaths.menu, element: <Menu/>},
    {path: routerPaths.profile, element: <Profile/>},
    {path: routerPaths.queues, element: <Queues/>},
    {path: routerPaths.queueDetails, element: <QueueDetails/>},
    {path: routerPaths.guide, element: <Guide/>},
    {path: routerPaths.schedule, element:<Schedule/>},
    {path: "*", element: <Navigate to={routerPaths.menu} replace/>},
];

export const publicRoutes = [
    {path: routerPaths.login, element: <Login/>},
    {path: routerPaths.registration, element: <Registration/>},
    {path: routerPaths.passwordReset, element: <PasswordReset/>},
    {path: routerPaths.forgotPassword, element: <ForgotPassword/>},
    {path: "*", element: <Navigate to={routerPaths.login} replace/>},
];
