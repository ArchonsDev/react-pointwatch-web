import React, { useState, useContext, useEffect } from "react";
import { Card, Nav, Col, Row, Container } from "react-bootstrap";

import SessionUserContext from "../../contexts/SessionUserContext";
import { getUser } from "../../api/user";

import General from "./General";
import Password from "./Password";
import Logs from "./Logs";

import logo from "../../images/logo1.png";
import styles from "./style.module.css";

const Settings = () => {
  const { user } = useContext(SessionUserContext);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("general");

  const handleSelectTab = (selectedTab) => {
    setActiveTab(selectedTab);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "general":
        return <General />;
      case "password":
        return <Password />;
      case "logs":
        return <Logs />;
      default:
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getUser(
        user,
        (response) => {
          console.log(response);
        },
        (error) => {
          if (error.response) {
            let statusCode = error.response.status;
            switch (statusCode) {
              case 404:
              case 403:
                console.log(error.response.data.error);
                break;
              default:
                break;
            }
          }
        }
      );
    };
    fetchData();
  }, []);

  return (
    <div className={styles.background}>
      <header className={styles.header}>
        <Row>
          <Col className="text-end">
            <h3>
              <img src={logo} height="50px" alt="PointWatch logo" /> PointWatch
            </h3>
          </Col>
        </Row>
      </header>

      <Container className="d-flex flex-column justify-content-start align-items-start">
        <Row className="mb-3">
          <h3 className={styles.label}>Settings</h3>
        </Row>
        <Row>
          <Nav
            variant="tabs"
            defaultActiveKey="general"
            onSelect={handleSelectTab}>
            <Nav.Item>
              <Nav.Link
                eventKey="general"
                className={`${styles.navHeader} ${
                  activeTab === "general"
                    ? styles.activeTab
                    : styles.inactiveTab
                }`}>
                General
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="password"
                className={`${styles.navHeader} ${
                  activeTab === "password"
                    ? styles.activeTab
                    : styles.inactiveTab
                }`}>
                Password
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="logs"
                className={`${styles.navHeader} ${
                  activeTab === "logs" ? styles.activeTab : styles.inactiveTab
                }`}>
                Logs
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Row>
        <Row>
          <Card className="p-4" style={{ width: "80rem" }}>
            <Card.Body>{renderActiveView()}</Card.Body>
          </Card>
        </Row>
      </Container>
    </div>
  );
};

export default Settings;
