import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Container,
  Dropdown,
  DropdownButton,
  InputGroup,
  Form,
  Table,
} from "react-bootstrap";

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

  const swtdData = [
    { id: 1, title: "SWTD Title 1", points: 100, status: "Pending" },
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
        <Row className="mb-3">
          <h3 className={styles.label}>SWTD Points Overview</h3>
        </Row>

        <Row className="mb-3">
          <Col xs="auto">
            <i className="fa-regular fa-calendar"></i> Term
          </Col>
          <Col xs="auto">
            <i className="fa-solid fa-building"></i> Department
          </Col>
          <Col xs="auto">
            <i class="fa-solid fa-circle-plus"></i> Total Points
          </Col>
          <Col xs="auto">
            <i class="fa-solid fa-plus-minus"></i> Excess/Lacking Points
          </Col>
        </Row>

        <Row className="w-100">
          <Col>
            <InputGroup className={`${styles.searchBar} mb-3`}>
              <InputGroup.Text id="basic-addon1">
                <i className="fa-solid fa-magnifying-glass"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Search"
                aria-label="Search"
                aria-describedby="basic-addon1"
              />
            </InputGroup>
          </Col>

          <Col className="d-flex align-items-center mb-3">
            <span className={styles.filterText}>Filter</span>
            <DropdownButton id="dropdown-basic-button" title="Dropdown button">
              <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
              <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
              <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
            </DropdownButton>
          </Col>
          <Col className="text-end">
            <BtnPrimary onClick={handleAddRecordClick}>
              Add a New Record
            </BtnPrimary>
          </Col>
        </Row>

        <Row className="w-100">
          <Table striped="columns" responsive>
            <thead>
              <tr>
                <th>No.</th>
                <th>Title of SWTD</th>
                <th>Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {swtdData.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.title}</td>
                  <td>{item.points}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Row>
      </Container>
    </div>
  );
};

export default SWTDDashboard;
