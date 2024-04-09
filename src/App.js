import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/registration";

import styles from "./styles/App.css";

const App = () => {
  const location = useLocation();

  const tabNames = {
    "/login": "Login",
    "/register": "Register",
  };

  document.title = tabNames[location.pathname] || "PointWatch";

  return (
    <div className={`${styles.App}`}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
};

export default App;
