import React, { useState } from "react";
import { Card, Nav, Row, Container } from "react-bootstrap";

import General from "./General";
import Password from "./Password";

import styles from "./style.module.css";

const Settings = () => {
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
      default:
    }
  };

  return (
    <Container className="d-flex flex-column justify-content-start align-items-start">
      <Row className="mb-2">
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
                activeTab === "general" ? styles.activeTab : styles.inactiveTab
              }`}>
              General
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="password"
              className={`${styles.navHeader} ${
                activeTab === "password" ? styles.activeTab : styles.inactiveTab
              }`}>
              Password
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Row>
      <Row className="w-100">
        <Card className={`${styles.card} p-4`}>
          <Card.Body>{renderActiveView()}</Card.Body>
        </Card>
      </Row>
    </Container>
  );
};

export default Settings;
