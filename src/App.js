import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom"; /* prettier-ignore */

import Login from "./pages/login";
import Register from "./pages/registration";
import ResetPassword from "./pages/reset password";
import Authorized from "./pages/authorized";

import SWTDDashboard from "./pages/employee dashboard";
import AddSWTD from "./pages/employee dashboard/AddSWTD";
import SWTDDetails from "./pages/employee dashboard/SWTDDetails";
import Dashboard from "./pages/dashboard";
import EmployeeSWTD from "./pages/dashboard/EmployeeSWTD";
import ViewSWTD from "./pages/dashboard/ViewSWTD";
import DisplaySWTD from "./pages/employee dashboard/DisplaySWTD";
import DepartmentalDashboard from "./pages/hr dashboard";
import Admin from "./pages/admin";
import Settings from "./pages/settings";
import Drawer from "./common/drawer";

import HRContextProvider from "./contexts/HRContext";
import SessionUserContext from "./contexts/SessionUserContext";
import { getUser } from "./api/user";
import styles from "./styles/App.module.css";

import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import msalConfig from "./oauth/msalConfig";

const msalInstance = new PublicClientApplication(msalConfig);

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = Cookies.get("userToken");
  const cookieID = Cookies.get("userID");
  const [user, setUser] = useState(null);

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
        const userData = response?.data.user;
        setUser(userData);
      },
      (error) => {
        console.error("Error fetching user session:", error.message);
      }
    );
  };

  const showDrawer = ["/swtd", "/dashboard", "/settings", "/admin", "/hr"].some(
    (path) => location.pathname.startsWith(path)
  );

  const tabNames = {
    "/login": "Login",
    "/register": "Register",
    "/dashboard": "Head Dashboard",
    "/reset": "Reset Password",
    "/settings": "Settings",
    "/swtd": "Dashboard",
    "/swtd/form": "Add a New Record",
    "/swtd/all": "SWTD Submissions",
    "/admin": "System Management",
    "/hr": "Points Overview",
    "/hr-dashboard": "Dashboard",
  };

  document.title = tabNames[location.pathname] || "PointWatch";

  document.title = location.pathname.startsWith("/swtd/all/")
    ? "SWTD Information"
    : tabNames[location.pathname] || "PointWatch";

  const values = { user, setUser };

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
      navigate("/");
    }

    if (data.token !== null && data.id !== null) getSessionUser();
  }, [data.token, data.id]);

  return (
    <MsalProvider instance={msalInstance}>
      <div
        className={`${styles.App} ${
          location.pathname === "/login" ? styles.bg : styles["no-bg"]
        }`}>
        <SessionUserContext.Provider value={values}>
          {showDrawer && <Drawer />}
          <Routes>
            <Route
              path="/"
              element={
                token ? <Navigate to="/swtd" /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/login"
              element={token ? <Navigate to="/swtd" /> : <Login />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="/reset" element={<ResetPassword />} />
            <Route path="/authorized" element={<Authorized />} />
            <Route path="/swtd/all" element={<DisplaySWTD />} />
            <Route
              path="/swtd"
              element={token ? <SWTDDashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/swtd/form"
              element={token ? <AddSWTD /> : <Navigate to="/login" />}
            />
            <Route
              path="/swtd/all/:swtd_id"
              element={token ? <SWTDDetails /> : <Navigate to="/login" />}
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
              path="/hr"
              element={
                token ? <DepartmentalDashboard /> : <Navigate to="/login" />
              }
            />
             <Route
              path="*"
              element={<Navigate to="/login" />}
            />
          </Routes>
        </SessionUserContext.Provider>
      </div>
    </MsalProvider>
  );
};

export default App;
