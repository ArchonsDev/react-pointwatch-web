import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom"; /* prettier-ignore */

import Login from "./pages/login";
import Register from "./pages/registration";
import ResetPassword from "./pages/reset password";
import Authorized from "./pages/authorized";

import SWTDDashboard from "./pages/employee dashboard";
import AddSWTD from "./pages/employee dashboard/AddSWTD";
import EditSWTD from "./pages/employee dashboard/EditSWTD";
import Dashboard from "./pages/dashboard";
import EmployeeSWTD from "./pages/dashboard/EmployeeSWTD";
import ViewSWTD from "./pages/dashboard/ViewSWTD";

import Admin from "./pages/admin";
import Settings from "./pages/settings";
import Drawer from "./common/drawer";
import Notifications from "./pages/notifications";

import SessionUserContext from "./contexts/SessionUserContext";
import { getUser } from "./api/user";

import styles from "./styles/App.module.css";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = Cookies.get("userToken");
  const cookieID = Cookies.get("userID");
  const [user, setUser] = useState(null);
  const [notifs, setNotifs] = useState([]);

  let id = null;
  if (cookieID !== undefined) {
    id = JSON.parse(cookieID);
  }

  const data = {
    token: token,
    id: id,
  };

  const getSessionUser = () => {
    getUser(
      {
        token: data.token,
        id: data.id,
      },
      (response) => {
        setUser(response?.data);
      }
    );
  };

  // Pages where Drawer/Navbar is displayed
  const showDrawer = [
    "/swtd",
    "/dashboard",
    "/settings",
    "/admin",
    "/notifications",
  ].some((path) => location.pathname.startsWith(path));

  // Changing of tabnames in Browser
  const tabNames = {
    "/login": "Login",
    "/register": "Register",
    "/dashboard": "Dashboard",
    "/reset": "Reset Password",
    "/settings": "Settings",
    "/swtd": "SWTD Points Overview",
    "/swtd/form": "Add a New Record",
    "/admin": "Admin",
    "/notifications": "Notifications",
  };

  document.title =
    location.pathname.startsWith("/swtd/") &&
    !location.pathname.startsWith("/swtd/form")
      ? "Training Information"
      : location.pathname.startsWith("/dashboard")
      ? "Dashboard"
      : tabNames[location.pathname] || "PointWatch";

  useEffect(() => {
    // Check if token is expired
    const isTokenExpired = (token) => {
      const decodedToken = jwtDecode(token);
      return decodedToken.exp * 1000 <= Date.now();
    };

    // Handling expired tokens
    if (token && isTokenExpired(token)) {
      Cookies.remove("userToken");
      Cookies.remove("userID");
      setUser(null);
      navigate("/");
    }

    if (data.token !== null && data.id !== null) {
      getSessionUser();
    }
  }, [data.token, data.id]);

  // Handles notifications
  useEffect(() => {
    const socket = io("http://localhost:5000/notifications", {
      transports: ["websocket"],
      auth: {
        token: data.token,
      },
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    socket.on("swtd_validation_update", (data) => {
      console.log("Received SWTD Validation Update:", data);
      const notif = { ...data, type: "SWTD Validation Update" };
      setNotifs((prev) => [...prev, notif]);
    });

    socket.on("term_clearing_update", (data) => {
      console.log("Received Clearance Update:", data);
      const notif = { ...data, type: "Received Clearance Update" };
      setNotifs((prev) => [...prev, notif]);
    });

    return () => {
      socket.disconnect();
    };
  }, [data.token]);

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
            element={token ? <Navigate to="/swtd" /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={token ? <Navigate to="/swtd" /> : <Login />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/authorized" element={<Authorized />} />
          <Route
            path="/swtd"
            element={token ? <SWTDDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/swtd/form"
            element={token ? <AddSWTD /> : <Navigate to="/login" />}
          />
          <Route
            path="/swtd/:swtd_id"
            element={token ? <EditSWTD /> : <Navigate to="/login" />}
          />
          <Route
            path="/settings"
            element={token ? <Settings /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={token ? <Dashboard /> : <Navigate to="/login" />}
          />

          <Route
            path="/dashboard/:id"
            element={token ? <EmployeeSWTD /> : <Navigate to="/login" />}
          />

          <Route
            path="/dashboard/:id/:swtd_id"
            element={token ? <ViewSWTD /> : <Navigate to="/login" />}
          />

          <Route
            path="/admin"
            element={token ? <Admin /> : <Navigate to="/login" />}
          />

          <Route
            path="/notifications"
            element={
              token ? (
                <Notifications notifs={notifs} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </SessionUserContext.Provider>
    </div>
  );
};

export default App;
