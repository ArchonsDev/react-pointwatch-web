import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Nav, Card, Spinner } from "react-bootstrap";

import Term from "./Term";
import Department from "./Department";
import DepartmentHeadActivity from "./DepartmentHeadActivity";
import HeadPromotion from "./HeadPromotion";
import StaffPromotion from "./StaffPromotion";
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
      case "department":
        return <Department />;
      case "activity":
        return <DepartmentHeadActivity />;
      case "head":
        return <HeadPromotion />;
      case "staff":
        return <StaffPromotion />;
      default:
    }
  };

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      if (user?.is_admin) navigate("/dashboard");
      else if (!user?.is_staff && !user?.is_superuser) navigate("/swtd");
      setLoading(false);
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
        <h3 className={styles.label}>System Management</h3>
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
              eventKey="department"
              className={`${styles.navHeader} ${
                activeTab === "department"
                  ? styles.activeTab
                  : styles.inactiveTab
              }`}>
              Department
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="activity"
              className={`${styles.navHeader} ${
                activeTab === "activity" ? styles.activeTab : styles.inactiveTab
              }`}>
              Validation & Clearance Reports
            </Nav.Link>
          </Nav.Item>
          {user?.is_superuser && (
            <>
              <Nav.Item>
                <Nav.Link
                  eventKey="head"
                  className={`${styles.navHeader} ${
                    activeTab === "head" ? styles.activeTab : styles.inactiveTab
                  }`}>
                  Department Heads
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="staff"
                  className={`${styles.navHeader} ${
                    activeTab === "staff"
                      ? styles.activeTab
                      : styles.inactiveTab
                  }`}>
                  HR Staff
                </Nav.Link>
              </Nav.Item>
            </>
          )}
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
