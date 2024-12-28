import React from "react";
import {createRoot} from "react-dom/client";
import App from "./App";
import './styles/index.scss'
import {AuthProvider} from "./context/context";

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(<AuthProvider> <App/> </AuthProvider>);
