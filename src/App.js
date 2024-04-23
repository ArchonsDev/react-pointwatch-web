import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/registration";
import Dashboard from "./pages/dashboard";
import SWTDDashboard from "./pages/employee dashboard";
import SWTDForm from "./pages/employee dashboard/SWTDForm";
import AdminDashboard from "./pages/admin dashboard";
import ResetPassword from "./pages/reset password";
import Authorized from "./pages/authorized";
import Settings from "./pages/settings";
import Drawer from "./common/drawer";

import SessionUserContext from "./contexts/SessionUserContext";
import { getUser } from "./api/user";

import styles from "./styles/App.module.css";

const App = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  const showDrawer = ["/dashboard", "/swtd", "/admin", "/settings"].some(
    (path) => location.pathname.startsWith(path)
  );

  const tabNames = {
    "/login": "Login",
    "/register": "Register",
    "/dashboard": "Dashboard",
    "/reset": "Reset Password",
    "/settings": "Settings",
    "/swtd": "SWTD Points Overview",
    "/swtd/form": "Add a New Record",
    "/admin": "Admin",
  };

  document.title = tabNames[location.pathname] || "PointWatch";

  const urlParams = new URLSearchParams(location.search);
  const token = urlParams.get("token");

  const accessToken = localStorage.getItem("accessToken");

  const getSessionUser = (token, email) => {
    getUser(
      { token: token, email: email },
      (response) => {
        console.log(response.data[0]);
        setUser(response.data[0]);
      },
      (error) => {
        console.log("Error fetching user data: ", error);
      }
    );
  };

  useEffect(() => {
    const isTokenExpired = (token) => {
      const decodedToken = jwtDecode(token);
      return decodedToken.exp * 1000 <= Date.now();
    };

    if (accessToken && isTokenExpired(accessToken)) {
      localStorage.removeItem("accessToken");
      setUser(null);
    }

    if (accessToken !== null) {
      const decodedToken = jwtDecode(accessToken);
      getSessionUser(accessToken, decodedToken.sub);
    }
  }, [accessToken]);

  return (
    <div
      className={`${styles.App} ${
        location.pathname === "/login" ? styles.bg : styles["no-bg"]
      }`}>
      <SessionUserContext.Provider value={{ user, setUser }}>
        {showDrawer && <Drawer />}
        <Routes>
          <Route
            path="/"
            element={
              accessToken ? (
                <Navigate to="/dashboard" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/dashboard"
            element={accessToken ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={accessToken ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<ResetPassword token={token} />} />
          <Route path="/authorized" element={<Authorized />} />
          <Route
            path="/settings"
            element={accessToken ? <Settings /> : <Navigate to="/login" />}
          />
          <Route
            path="/swtd"
            element={accessToken ? <SWTDDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/swtd/form"
            element={accessToken ? <SWTDForm /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={
              accessToken ? <AdminDashboard /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </SessionUserContext.Provider>
    </div>
  );
};

export default App;
