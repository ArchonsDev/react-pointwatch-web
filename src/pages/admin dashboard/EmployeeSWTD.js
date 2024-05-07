import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup } from "react-bootstrap"; /* prettier-ignore */

import { getAllSWTDs } from "../../api/swtd";
import { getUser } from "../../api/user";
import SessionUserContext from "../../contexts/SessionUserContext";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import styles from "./style.module.css";

const EmployeeSWTD = () => {
  const { id } = useParams();
  const token = Cookies.get("userToken");
  const navigate = useNavigate();

  const [userSWTDs, setUserSWTDs] = useState([]);
  const [employee, setEmployee] = useState(null);

  const fetchUser = async () => {
    await getUser(
      {
        id: id,
        token: token,
      },
      (response) => {
        setEmployee(response.data);
      },
      (error) => {
        console.log(error.response);
      }
    );
  };

  const fetchAllSWTDs = async () => {
    await getAllSWTDs(
      {
        author_id: id,
        token: token,
      },
      (response) => {
        setUserSWTDs(response.swtds);
      },
      (error) => {
        if (error.response && error.response.data) {
          console.log(error.response.data.error);
        }
      }
    );
  };

  const handleBackClick = () => {
    navigate("/admin");
  };

  useEffect(() => {
    fetchUser();
    fetchAllSWTDs();
  }, []);

  const handleViewSWTD = (swtd_id) => {
    navigate(`/admin/${id}/${swtd_id}`);
  };

  const pageTitle = employee
    ? `${employee.firstname}'s SWTD Points Overview`
    : "SWTD Points Overview";

  return (
    <div className={styles.background}>
      <Container className="d-flex flex-column justify-content-start align-items-start">
        <Row className="mb-2">
          <h3 className={styles.label}>
            <i
              className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
              onClick={handleBackClick}
            ></i>{" "}
            {pageTitle}
          </h3>
        </Row>

        <Row className={`${styles.employeeDetails} w-100 mb-3`}>
          <Col xs="auto">
            <i className="fa-regular fa-calendar me-2"></i> Term:
          </Col>
          <Col xs="auto">
            <i className="fa-solid fa-building me-2"></i>Department:{" "}
            {employee?.department}
          </Col>
          <Col xs="auto">
            <i className="fa-solid fa-circle-plus me-2"></i>Total Points:{" "}
            {employee?.swtd_points.valid_points}
          </Col>
          <Col xs="auto">
            <i className="fa-solid fa-plus-minus me-2"></i>Excess/Lacking
            Points:
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
            {userSWTDs &&
              userSWTDs.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  className={styles.tableBody}
                  onClick={() => handleViewSWTD(item.id)}
                >
                  <Row>
                    <Col xs={1}>{item.id}</Col>
                    <Col xs={7}>{item.title}</Col>
                    <Col xs={2}>{item.points}</Col>
                    <Col xs={2}>{item.validation.status}</Col>
                  </Row>
                </ListGroup.Item>
              ))}
          </ListGroup>
        </Row>
      </Container>
    </div>
  );
};

export default EmployeeSWTD;
