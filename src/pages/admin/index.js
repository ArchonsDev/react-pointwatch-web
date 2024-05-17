import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Nav, Card } from "react-bootstrap";

import Term from "./Term";
import Logs from "./Logs";
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
      case "logs":
        return <Logs />;
      default:
    }
  };

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      setLoading(false);
      if (!user?.is_admin && !user?.is_superuser) navigate("/swtd");
    }
  }, [user, navigate]);

  if (loading) return null;

  return (
    <Container className="d-flex flex-column justify-content-start align-items-start">
      <Row className="mb-2">
        <h3 className={styles.label}>Admin</h3>
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
              eventKey="logs"
              className={`${styles.navHeader} ${
                activeTab === "logs" ? styles.activeTab : styles.inactiveTab
              }`}>
              Logs
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
