import React, { useContext, useEffect } from "react";
import { Row, Col } from "react-bootstrap";

import SessionUserContext from "../../contexts/SessionUserContext";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import styles from "./style.module.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, setUser } = useContext(SessionUserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  useEffect(() => {
    if (user === null) {
      navigate("/");
    }
  }, [navigate, user]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.sidebar}>
        <ul>
          <li>Dashboard</li>
          <li>Analytics</li>
          <li>Settings</li>
        </ul>
      </div>
      <div className="main-content">
        <h1>Welcome to Your Dashboard</h1>
        <p>This is where your dashboard content will go.</p>
      </div>

      <Row>
        <Col>
          <BtnPrimary onClick={handleLogout}>Logout</BtnPrimary>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
