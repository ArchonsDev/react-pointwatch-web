import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup } from "react-bootstrap"; /* prettier-ignore */

import departments from "../../data/departments.json";
import { getAllUsers } from "../../api/admin";
import SessionUserContext from "../../contexts/SessionUserContext";

import styles from "./style.module.css";

const Dashboard = () => {
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const token = Cookies.get("userToken");
  const userID = Cookies.get("userID");

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

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

  const handleEmployeeSWTDClick = (id) => {
    navigate(`/dashboard/${id}`);
  };

  const displayEmployee = users.filter(
    (user) =>
      (selectedDepartment ? user.department === selectedDepartment : true) &&
      (searchQuery === "" ||
        user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.employee_id.includes(searchQuery))
  );

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      setLoading(false);
      if (!user?.is_admin && !user?.is_staff && !user?.is_superuser)
        navigate("/swtd");
      else fetchAllUsers();
    }
  }, [user, navigate]);

  if (loading) return null;

  return (
    <Container className="d-flex flex-column justify-content-start align-items-start">
      <Row className="mb-2">
        <h3 className={styles.label}>Dashboard</h3>
      </Row>

      <Row className="w-100">
        <Col className="text-start" md={6}>
          <InputGroup className={`${styles.searchBar} mb-3`}>
            <InputGroup.Text>
              <i className="fa-solid fa-magnifying-glass"></i>
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col className="text-end" md={3}>
          <Form.Group as={Row} controlId="inputFilter">
            <Form.Label className={styles.filterText} column sm="4">
              Department
            </Form.Label>
            <Col>
              <Form.Select
                className={styles.filterOption}
                name="filter"
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                }}>
                <option value="">All departments</option>
                {departments.departments.map((department, index) => (
                  <option key={index} value={department}>
                    {department}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Form.Group>
        </Col>
      </Row>

      <Row className="w-100">
        {displayEmployee.length === 0 &&
        (selectedDepartment === "" || selectedDepartment !== "") ? (
          <span
            className={`${styles.msg} d-flex justify-content-center align-items-center mt-5 w-100`}>
            No employees found.
          </span>
        ) : (
          <>
            <ListGroup className="w-100" variant="flush">
              {users.length !== 0 && (
                <ListGroup.Item className={styles.tableHeader}>
                  <Row>
                    <Col xs={3}>ID No.</Col>
                    <Col xs={5}>Name</Col>
                    <Col xs={2}>Department</Col>
                    <Col className="text-center" xs={2}>
                      Point Balance
                    </Col>
                  </Row>
                </ListGroup.Item>
              )}
            </ListGroup>
            <ListGroup>
              {displayEmployee &&
                displayEmployee
                  .filter((item) => item.id !== parseInt(userID, 10))
                  .map((item) => (
                    <ListGroup.Item
                      key={item.id}
                      className={styles.tableBody}
                      onClick={() => handleEmployeeSWTDClick(item.id)}>
                      <Row>
                        <Col xs={3}>{item.employee_id}</Col>
                        <Col xs={5}>
                          {item.firstname} {item.lastname}
                        </Col>
                        <Col xs={2}>{item.department}</Col>
                        <Col className="text-center" xs={2}>
                          {item.point_balance}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
            </ListGroup>
          </>
        )}
      </Row>
    </Container>
  );
};

export default Dashboard;
