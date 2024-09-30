import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup, Spinner, Pagination, Card, ProgressBar, Dropdown, DropdownButton } from "react-bootstrap"; /* prettier-ignore */

import departmentTypes from "../../data/departmentTypes.json";
import { getAllUsers, getTerms } from "../../api/admin";
import { getClearanceStatus } from "../../api/user";
import SessionUserContext from "../../contexts/SessionUserContext";

import styles from "./style.module.css";

const Dashboard = () => {
  const token = Cookies.get("userToken");
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();

  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [userClearanceStatus, setUserClearanceStatus] = useState({});
  const [requiredPoints, setRequiredPoints] = useState(0);
  const lackingUsers = Object.values(userClearanceStatus).filter(
    (status) => status.points.valid_points < requiredPoints
  ).length;

  const validUsers = Object.values(userClearanceStatus).filter(
    (status) => status.points.valid_points >= requiredPoints
  ).length;

  const lackingUsersPercentage = (lackingUsers / departmentUsers.length) * 100;

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
        setDepartmentUsers(
          response.users.filter(
            (us) => us.department === user.department && us.id !== user.id
          )
        );
        setLoading(false);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const fetchTerms = () => {
    const allowedTerm = departmentTypes[user?.department];
    getTerms(
      {
        token: token,
      },
      (response) => {
        const filteredTerms = response.terms.filter((term) =>
          allowedTerm.includes(term.type)
        );

        const ongoingTerm = filteredTerms.find(
          (term) => term.is_ongoing === true
        );
        setTerms(filteredTerms);
        setSelectedTerm(ongoingTerm || filteredTerms[0]);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const fetchClearanceStatus = (
    userId,
    term,
    employee_id,
    firstname,
    lastname
  ) => {
    getClearanceStatus(
      {
        id: userId,
        term_id: term.id,
        token: token,
      },
      (response) => {
        setUserClearanceStatus((prevStatus) => ({
          ...prevStatus,
          [userId]: {
            ...response,
            employee_id,
            firstname,
            lastname,
          },
        }));
        setRequiredPoints(response.points.required_points);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const fetchClearanceStatusForAllUsers = (term) => {
    departmentUsers.forEach((us) => {
      const { id, employee_id, firstname, lastname } = us;
      fetchClearanceStatus(id, term, employee_id, firstname, lastname);
    });
  };

  const getTopEmployeePoints = () => {
    return Object.entries(userClearanceStatus)
      .map(([userId, status]) => ({
        userId,
        ...status,
        valid_points: status.points?.valid_points || 0,
      }))
      .sort((a, b) => b.valid_points - a.valid_points)
      .slice(0, 5);
  };
  const topUsers = getTopEmployeePoints();

  const handleEmployeeSWTDClick = (id) => {
    navigate(`/dashboard/${id}`);
  };

  const filteredUsers = departmentUsers.filter(
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
      else {
        const fetchData = async () => {
          await fetchAllUsers();
          fetchTerms();
        };
        fetchData();
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (selectedTerm) {
      fetchClearanceStatusForAllUsers(selectedTerm);
    }
  }, [selectedTerm]);

  useEffect(() => {
    console.log("Updated user clearance status:", userClearanceStatus);
  }, [userClearanceStatus]);

  if (loading)
    return (
      <Row
        className={`${styles.msg} d-flex justify-content-center align-items-center w-100`}>
        <Spinner className={`me-2`} animation="border" />
        Loading data...
      </Row>
    );

  return (
    <Container className="d-flex flex-column justify-content-start align-items-start">
      <Row className="mb-3 w-100">
        <Col>
          <h3 className={styles.label}>
            {user.department} Department Dashboard
          </h3>
        </Col>
        <Col
          className={`d-flex align-items-center ${styles.employeeDetails}`}
          md="auto">
          <i className="fa-regular fa-calendar me-2"></i> Term:{" "}
          {terms.length === 0 ? (
            <>No terms were added yet.</>
          ) : (
            <DropdownButton
              className={`ms-2`}
              variant={
                selectedTerm?.is_ongoing === true ? "success" : "secondary"
              }
              size="sm"
              title={selectedTerm?.name}>
              {terms &&
                terms.map((term) => (
                  <Dropdown.Item
                    key={term.id}
                    onClick={() => {
                      setSelectedTerm(term);
                    }}>
                    {term.name}
                  </Dropdown.Item>
                ))}
            </DropdownButton>
          )}
        </Col>
      </Row>

      <Row className="w-100 mb-3">
        <Col md="7">
          <Card className={styles.blackCard}>
            <Card.Body>
              <Row>
                <Col
                  className={`${styles.cardCol1} d-flex justify-content-center align-items-center flex-column p-2`}
                  md="5">
                  <Row className="text-center">
                    % of employees lacking points
                  </Row>
                  <Row className={styles.lackingPercent}>
                    {lackingUsersPercentage}%
                  </Row>
                  <Row className="w-100">
                    <Col>
                      <ProgressBar
                        className={styles.bar}
                        now={lackingUsersPercentage}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col className={`${styles.depCol}`}>
                  <span className={`${styles.depTitle} mb-3`}>
                    Department Statistics
                  </span>
                  <hr className="m-0 mb-2" style={{ opacity: "1" }} />
                  <Row className={`${styles.depStat} w-100 mb-2`}>
                    <Col md="auto">Total Employees</Col>
                    <Col className="text-end">{departmentUsers.length}</Col>
                  </Row>
                  <Row className={`${styles.depStat} w-100 mb-2`}>
                    <Col md="auto">Employees Lacking Points</Col>
                    <Col className="text-end">{lackingUsers}</Col>
                  </Row>
                  <Row className={`${styles.depStat} w-100`}>
                    <Col md="auto">Employees with Required Points</Col>
                    <Col className="text-end">{validUsers}</Col>
                  </Row>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <span>Point Standings for {selectedTerm?.name}</span>
          <hr className="m-0 mb-2" style={{ opacity: "1" }} />
          <Row>
            <Col>ID No. - Name</Col>
            <Col className="text-end">Points</Col>
          </Row>
          {topUsers.map((user) => (
            <Row key={user.userId}>
              <Col md="6">
                {user.employee_id} - {user.firstname} {user.lastname}
              </Col>
              <Col className="text-end" md="6">
                {user.points?.valid_points || 0} {/* Display valid points */}
              </Col>
            </Row>
          ))}
        </Col>
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
            className={`${styles.msg} d-flex justify-content-center align-items-center mt-5 w-100`}>
            No employees found.
          </span>
        ) : (
          <div className="mb-3">
            <ListGroup className="w-100" variant="flush">
              {departmentUsers.length !== 0 && (
                <ListGroup.Item className={styles.tableHeader}>
                  <Row>
                    <Col md={2}>ID No.</Col>
                    <Col>Name</Col>
                    <Col className="text-center" md={2}>
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
                  onClick={() => handleEmployeeSWTDClick(item.id)}>
                  <Row>
                    <Col md={2}>{item.employee_id}</Col>
                    <Col>
                      {item.firstname} {item.lastname}
                    </Col>
                    <Col className="text-center" md={2}>
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
            <Pagination className={styles.pageNum}>
              <Pagination.First onClick={() => paginate(1)} />
              <Pagination.Prev
                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
              />
              {Array.from(
                { length: Math.ceil(filteredUsers.length / rowsPerPage) },
                (_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => paginate(index + 1)}>
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
                onClick={() =>
                  paginate(Math.ceil(filteredUsers.length / rowsPerPage))
                }
              />
            </Pagination>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
