import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container } from "react-bootstrap";

import SessionUserContext from "../../contexts/SessionUserContext";
import BtnPrimary from "../../common/buttons/BtnPrimary";

import styles from "./style.module.css";

const AdminDashboard = () => {
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user?.is_admin && !user?.is_superuser) {
      navigate("/swtd");
    }
  }, []);

  return (
    <div className={styles.background}>
      <Container className="d-flex flex-column justify-content-start align-items-start">
        <Row className="mb-3">
          <h3 className={styles.label}>Admin Dashboard</h3>
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

export default AdminDashboard;
