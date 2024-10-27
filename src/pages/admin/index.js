import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Nav, Card, Spinner, Dropdown } from "react-bootstrap";
import Cookies from "js-cookie";

import Term from "./Term";
import Department from "./Department";
import DepartmentHeadActivity from "./DepartmentHeadActivity";
import HeadPromotion from "./HeadPromotion";
import StaffPromotion from "./StaffPromotion";
import SessionUserContext from "../../contexts/SessionUserContext";

import styles from "./style.module.css";
const Admin = () => {
  const { user } = useContext(SessionUserContext);
  const token = Cookies.get("userToken");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("term");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 995);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 995);
  };

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
        return null;
    }
  };

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      if (user?.access_level === 1) navigate("/dashboard");
      else if (user?.access_level < 1) navigate("/swtd");
      setLoading(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    <Container className="d-flex flex-column justify-content-center align-items-center">
      <Row className="w-100 mb-2">
        <h3 className={styles.label}>System Management</h3>
      </Row>

      <Row className="w-100">
        <Nav variant="tabs" defaultActiveKey="term" onSelect={handleSelectTab}>
          <Nav.Item>
            <Nav.Link
              eventKey="term"
              className={`${styles.navHeader} ${
                activeTab === "term" ? styles.activeTab : styles.inactiveTab
              }`}>
              Terms
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
              Departments
            </Nav.Link>
          </Nav.Item>
          {isMobile ? (
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle
                as={Nav.Link}
                className={`${styles.navHeader} ${styles.inactiveTab}`}>
                More
              </Dropdown.Toggle>
              <Dropdown.Menu className={styles.formLabel}>
                {/* <Dropdown.Item onClick={() => setActiveTab("activity")}>
                  Validation & Clearance Reports
                </Dropdown.Item> */}
                <Dropdown.Item onClick={() => setActiveTab("head")}>
                  Head/Chair Promotion
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setActiveTab("staff")}>
                  HR Staff Promotion
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <>
              <Nav.Item>
                {/* <Nav.Link
                  eventKey="activity"
                  className={`${styles.navHeader} ${
                    activeTab === "activity"
                      ? styles.activeTab
                      : styles.inactiveTab
                  }`}>
                  Validation & Clearance Reports
                </Nav.Link> */}
              </Nav.Item>

              <Nav.Item>
                <Nav.Link
                  eventKey="head"
                  className={`${styles.navHeader} ${
                    activeTab === "head" ? styles.activeTab : styles.inactiveTab
                  }`}>
                  Head/Chair Promotion
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
                  HR Staff Promotion
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
