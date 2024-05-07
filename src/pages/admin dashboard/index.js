import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup } from "react-bootstrap"; /* prettier-ignore */

import { getAllUsers } from "../../api/admin";
import SessionUserContext from "../../contexts/SessionUserContext";
import BtnPrimary from "../../common/buttons/BtnPrimary";

import styles from "./style.module.css";

const AdminDashboard = () => {
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const token = Cookies.get("userToken");
  const userID = Cookies.get("userID");

  const fetchAllUsers = async () => {
    await getAllUsers(
      {
        token: token,
      },
      (response) => {
        setUsers(response.users);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (!user?.is_admin && !user?.is_superuser) {
      navigate("/swtd");
    }
  }, []);

  const handleEmployeeSWTDClick = (id) => {
    navigate(`/admin/${id}`);
  };

  return (
    <div className={styles.background}>
      <Container className="d-flex flex-column justify-content-start align-items-start">
        <Row className="mb-2">
          <h3 className={styles.label}>Admin Dashboard</h3>
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
            <BtnPrimary>Export Report</BtnPrimary>
          </Col>
        </Row>

        {/* Follow the UI in the doc for this table */}
        <Row className="w-100">
          <ListGroup className="w-100" variant="flush">
            <ListGroup.Item className={styles.tableHeader}>
              <Row>
                <Col xs={3}>ID No.</Col>
                <Col xs={4}>Name</Col>
                <Col xs={3}>Department</Col>
                <Col xs={2}>Points</Col>
              </Row>
            </ListGroup.Item>
          </ListGroup>
          <ListGroup>
            {users &&
              users
                .filter((item) => item.id !== parseInt(userID, 10))
                .map((item) => (
                  <ListGroup.Item
                    key={item.id}
                    className={styles.tableBody}
                    onClick={() => handleEmployeeSWTDClick(item.id)}
                  >
                    <Row>
                      <Col xs={3}>{item.employee_id}</Col>
                      <Col xs={4}>
                        {item.firstname} {item.lastname}
                      </Col>
                      <Col xs={3}>{item.department}</Col>
                      <Col xs={2}>{item.swtd_points.valid_points}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
          </ListGroup>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;
