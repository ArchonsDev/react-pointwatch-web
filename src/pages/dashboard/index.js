import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup, Spinner, Pagination, Card } from "react-bootstrap"; /* prettier-ignore */

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

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const fetchAllUsers = async () => {
    await getAllUsers(
      {
        token: token,
      },
      (response) => {
        setUsers(response.users);
        setLoading(false);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const handleEmployeeSWTDClick = (id) => {
    navigate(`/dashboard/${id}`);
  };

  const filteredUsers = users.filter(
    (userItem) =>
      userItem.department === user.department &&
      (searchQuery === "" ||
        userItem.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userItem.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userItem.employee_id.includes(searchQuery))
  );

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      if (!user?.is_admin && !user?.is_staff && !user?.is_superuser)
        navigate("/swtd");
      else fetchAllUsers();
    }
  }, [user, navigate]);

  if (loading)
    return (
      <Row
        className={`${styles.msg} d-flex justify-content-center align-items-center w-100`}
      >
        <Spinner className={`me-2`} animation="border" />
        Loading data...
      </Row>
    );

  return (
    <Container className="d-flex flex-column justify-content-start align-items-start">
      <Row className="mb-2">
        <h3 className={styles.label}>
          {user.department} Department Dashboard
        </h3>
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

        {/*<Col className="text-end" md={3}>
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
                }}
              >
                <option value="">All departments</option>
                {departments.departments.map((department, index) => (
                  <option key={index} value={department}>
                    {department}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Form.Group>
        </Col>*/}
      </Row>

      <Row className="w-100">
        {currentUsers.length === 0 ? (
            <span
              className={`${styles.msg} d-flex justify-content-center align-items-center mt-5 w-100`}
            >
              No employees found.
            </span>
        ) : (
          <div className="mb-3">
            <ListGroup className="w-100" variant="flush">
              {users.length !== 0 && (
                <ListGroup.Item className={styles.tableHeader}>
                  <Row>
                    <Col xs={3}>ID No.</Col>
                    <Col xs={5}>Name</Col>
                    <Col className="text-center" xs={2}>
                      Point Balance
                    </Col>
                  </Row>
                </ListGroup.Item>
              )}
            </ListGroup>
            <ListGroup>
              {currentUsers.map((item) => (
                <ListGroup.Item
                      key={item.id}
                      className={styles.tableBody}
                      onClick={() => handleEmployeeSWTDClick(item.id)}
                    >
                      <Row>
                        <Col xs={3}>{item.employee_id}</Col>
                        <Col xs={5}>
                          {item.firstname} {item.lastname}
                        </Col>
                        <Col className="text-center" xs={2}>
                          {item.point_balance}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
            </ListGroup>
          </div>
        )}
      </Row>
      <Row className="w-100 mb-3">
        <Col className="d-flex justify-content-center">
          <div className="pagination-container">
            <Pagination size="sm">
              <Pagination.First onClick={() => paginate(1)} />
              <Pagination.Prev onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)} />
              {Array.from(
                { length: Math.ceil(filteredUsers.length / rowsPerPage) },
                (_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                )
              )}
              <Pagination.Next
                onClick={() =>
                  paginate(
                    currentPage < filteredUsers.length / rowsPerPage
                      ? currentPage + 1
                      : currentPage
                  )
                }
              />
              <Pagination.Last
                onClick={() => paginate(Math.ceil(filteredUsers.length / rowsPerPage))}
              />
            </Pagination>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
