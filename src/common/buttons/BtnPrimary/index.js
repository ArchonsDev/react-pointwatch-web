import React from "react";
import styles from "./style.module.css";

const BtnPrimary = ({ onClick, children, type = "button", ...rest }) => {
  return (
    <button
      {...rest}
      type={type}
      className={`${styles["button-style"]} px-4 py-1`}
      onClick={onClick}>
      {children}
    </button>
  );
};

export default BtnPrimary;
