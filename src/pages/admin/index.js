import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Nav, Card, Spinner } from "react-bootstrap";

import Term from "./Term";
import ValidationActivity from "./ValidationActivity";
import ClearanceActivity from "./ClearanceActivity";
import SessionUserContext from "../../contexts/SessionUserContext";

import styles from "./style.module.css";
const Admin = () => {
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("term");

  const handleSelectTab = (selectedTab) => {
    setActiveTab(selectedTab);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "term":
        return <Term />;
      case "validation":
        return <ValidationActivity />;
      case "clearance":
        return <ClearanceActivity />;
      default:
    }
  };

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      setLoading(false);
      if (!user?.is_staff && !user?.is_superuser)
        console.log("User is neither staff nor superuser, navigating away.");
    }
  }, [user, navigate]);

  if (loading)
    return (
      <Row
        className={`${styles.loading} d-flex justify-content-center align-items-center w-100`}>
        <Spinner className={`me-2`} animation="border" />
        Loading data...
      </Row>
    );

  return (
    <Container className="d-flex flex-column justify-content-start align-items-start">
      <Row className="mb-2">
        <h3 className={styles.label}>HR Management Dashboard</h3>
      </Row>

      <Row>
        <Nav variant="tabs" defaultActiveKey="term" onSelect={handleSelectTab}>
          <Nav.Item>
            <Nav.Link
              eventKey="term"
              className={`${styles.navHeader} ${
                activeTab === "term" ? styles.activeTab : styles.inactiveTab
              }`}>
              Term
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="validation"
              className={`${styles.navHeader} ${
                activeTab === "validation"
                  ? styles.activeTab
                  : styles.inactiveTab
              }`}>
              Validation Activity
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="clearance"
              className={`${styles.navHeader} ${
                activeTab === "clearance"
                  ? styles.activeTab
                  : styles.inactiveTab
              }`}>
              Clearance Activity
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

export default Admin;
