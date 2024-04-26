import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup } from "react-bootstrap"; /* prettier-ignore */

import SessionUserContext from "../../contexts/SessionUserContext";
import BtnPrimary from "../../common/buttons/BtnPrimary";

import logo from "../../images/logo1.png";
import styles from "./style.module.css";

const SWTDDashboard = () => {
  const { user, setUser } = useContext(SessionUserContext);
  const navigate = useNavigate();

  const handleAddRecordClick = () => {
    navigate("/swtd/form");
  };

  const handleEditRecordClick = (id) => {
    navigate(`/swtd/${id}`);
  };

  // this shouldn't exist for the rendering of data, pls remove
  // when testing
  const swtdData = [
    { id: 1, title: "SWTD Title 1", points: 2, status: "Pending" },
    { id: 2, title: "SWTD Title 2", points: 5, status: "Rejected" },
  ];

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
        <Row className="mb-2">
          <h3 className={styles.label}>SWTD Points Overview</h3>
        </Row>

        <Row className={`${styles.employeeDetails} w-100 mb-3`}>
          <Col xs="auto">
            <i className="fa-regular fa-calendar"></i> Term
          </Col>
          <Col xs="auto">
            <i className="fa-solid fa-building"></i> {user?.department}
          </Col>
          <Col xs="auto">
            <i className="fa-solid fa-circle-plus"></i> Total Points
          </Col>
          <Col xs="auto">
            <i className="fa-solid fa-plus-minus"></i> Excess/Lacking Points
          </Col>
        </Row>

        <Row className="w-100">
          <Col className="text-start" md={6}>
            <InputGroup className={`${styles.searchBar} mb-3`}>
              <InputGroup.Text>
                <i className="fa-solid fa-magnifying-glass"></i>
              </InputGroup.Text>
              <Form.Control type="search" placeholder="Search" />
            </InputGroup>
          </Col>

          <Col className="text-end" md={3}>
            <Form.Group as={Row} controlId="inputFilter">
              <Form.Label className={styles.filterText} column sm="3">
                Filter
              </Form.Label>
              <Col sm="9">
                <Form.Select name="filter">
                  <option value="">Points</option>
                  <option value="">Status</option>
                  <option value="">Yeah</option>
                </Form.Select>
              </Col>
            </Form.Group>
          </Col>
          <Col className="text-end" md={3}>
            <BtnPrimary onClick={handleAddRecordClick}>
              Add a New Record
            </BtnPrimary>
          </Col>
        </Row>

        <Row className="w-100">
          <ListGroup className="w-100" variant="flush">
            <ListGroup.Item className={styles.tableHeader}>
              <Row>
                <Col xs={1}>No.</Col>
                <Col xs={7}>Title of SWTD</Col>
                <Col xs={2}>Points</Col>
                <Col xs={2}>Status</Col>
              </Row>
            </ListGroup.Item>
          </ListGroup>
          <ListGroup>
            {swtdData.map((item) => (
              <ListGroup.Item
                key={item.id}
                className={styles.tableBody}
                onClick={() => handleEditRecordClick(item.id)}>
                <Row>
                  <Col xs={1}>{item.id}</Col>
                  <Col xs={7}>{item.title}</Col>
                  <Col xs={2}>{item.points}</Col>
                  <Col xs={2}>{item.status}</Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Row>
      </Container>
    </div>
  );
};

export default SWTDDashboard;
