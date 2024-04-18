import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/registration";
import Dashboard from "./pages/swtd dashboard";
import ResetPassword from "./pages/reset password";

import SessionUserContext from "./contexts/SessionUserContext";

import styles from "./styles/App.module.css";

const App = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  const tabNames = {
    "/login": "Login",
    "/register": "Register",
    "/dashboard": "Dashboard",
    "/reset": "Reset Password",
  };

  document.title = tabNames[location.pathname] || "PointWatch";

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setUser(accessToken);
    }
  }, []);

  return (
    <div
      className={`${styles.App} ${
        location.pathname === "/login" ? styles.bg : styles["no-bg"]
      }`}>
      <SessionUserContext.Provider value={{ user, setUser }}>
        <Routes>
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reset" element={<ResetPassword />} />
        </Routes>
      </SessionUserContext.Provider>
    </div>
  );
};

export default App;
