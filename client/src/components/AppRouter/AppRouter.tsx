import React from "react";
import { Routes, Route } from "react-router-dom";
import {IAuthContext, useAuthContext} from "../../context/context";
import { privateRoutes, publicRoutes } from "../../router/router";

const AppRouter = () => {
  const { isAuth } = useAuthContext();

  return isAuth ? (
    <Routes>
      {privateRoutes.map((route) => (
        <Route element={route.element} path={route.path} key={route.path} />
      ))}
    </Routes>
  ) : (
    <Routes>
      {publicRoutes.map((route) => (
        <Route element={route.element} path={route.path} key={route.path} />
      ))}
    </Routes>
  );
};

export default AppRouter;
