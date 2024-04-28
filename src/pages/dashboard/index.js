import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container } from "react-bootstrap";

import SessionUserContext from "../../contexts/SessionUserContext";
import BtnPrimary from "../../common/buttons/BtnPrimary";

import logo from "../../images/logo1.png";
import styles from "./style.module.css";

const Dashboard = () => {
  /**
   * Dashboard
   *    Drawer tab: Dashboard
   *    the table with the list of employees and their points and allat
   *
   * Employee Dashboard
   *    Drawer tab: SWTDs
   *    the table with the owner's list of SWTDs
   *
   * Admin Dashboard
   *    Drawer tab: Admin
   *    all the stuff admin can do, modifying accs, etc
   */
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();
  // useEffect(() => {
  //   if (!user?.is_admin || !user?.is_staff) {
  //     navigate("/swtd");
  //   }
  // }, []);

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
          <h3 className={styles.label}>Dashboard</h3>
        </Row>

        <Row className="w-100">
          <Col sm="4">Search bar goes here D:</Col>
          <Col sm="4">Filter bar goes here D:</Col>
          <Col className="text-end" sm="4">
            <BtnPrimary>Export Report</BtnPrimary>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
