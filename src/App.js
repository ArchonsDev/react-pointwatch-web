import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/registration";
import ResetPassword from "./pages/reset password";
import Authorized from "./pages/authorized";

import Dashboard from "./pages/dashboard";
import SWTDDashboard from "./pages/employee dashboard";
import AddSWTD from "./pages/employee dashboard/AddSWTD";
import EditSWTD from "./pages/employee dashboard/EditSWTD";
import AdminDashboard from "./pages/admin dashboard";

import Settings from "./pages/settings";
import Drawer from "./common/drawer";

import SessionUserContext from "./contexts/SessionUserContext";
import { getUser } from "./api/user";

import styles from "./styles/App.module.css";

const App = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  const token = Cookies.get("userToken");
  const cookieID = Cookies.get("userID");

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

  document.title =
    location.pathname.startsWith("/swtd/") &&
    !location.pathname.startsWith("/swtd/form")
      ? "Training Information"
      : tabNames[location.pathname] || "WildPark";

  useEffect(() => {
    const isTokenExpired = (token) => {
      const decodedToken = jwtDecode(token);
      return decodedToken.exp * 1000 <= Date.now();
    };

    // Handling expired tokens
    if (token && isTokenExpired(token)) {
      Cookies.remove("userToken");
      Cookies.remove("userID");
      setUser(null);
    }

    if (data.token !== null && data.id !== null) {
      getSessionUser();
    }
  }, [data.token, data.id]);

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<ResetPassword token={token} />} />
          <Route path="/authorized" element={<Authorized />} />
          <Route path="/swtd" element={<SWTDDashboard />} />
          <Route path="/swtd/form" element={<AddSWTD />} />
          <Route path="/swtd/:id" element={<EditSWTD />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </SessionUserContext.Provider>
    </div>
  );
};

export default App;
