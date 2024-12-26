import React, { useEffect } from "react";
import {IAuthContext, useAuthContext} from "../context/context";

const Menu = () => {
  const { setCurrent }: IAuthContext = useAuthContext();
  useEffect(() => {
    setCurrent("menu");
  }, []);

  return <div>Menu</div>;
};

export default Menu;
