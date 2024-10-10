import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup, Spinner, Pagination, Card, ProgressBar, Dropdown, DropdownButton } from "react-bootstrap"; /* prettier-ignore */

import status from "../../data/status.json";
import departmentTypes from "../../data/departmentTypes.json";
import { getAllUsers, getTerms } from "../../api/admin";
import { getClearanceStatus } from "../../api/user";
import { getAllSWTDs } from "../../api/swtd";
import SessionUserContext from "../../contexts/SessionUserContext";

import styles from "./style.module.css";

const Dashboard = () => {
  const token = Cookies.get("userToken");
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();

  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [noUsers, setNoUsers] = useState(true);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [userClearanceStatus, setUserClearanceStatus] = useState([]);
  const [requiredPoints, setRequiredPoints] = useState(0);
  const lackingUsers = Object.values(userClearanceStatus).filter(
    (status) => status.points.valid_points < requiredPoints
  ).length;

  const validUsers = Object.values(userClearanceStatus).filter(
    (status) => status.points.valid_points >= requiredPoints
  ).length;

  const clearedUsersPercentage = (
    (validUsers / departmentUsers.length) *
    100
  ).toFixed(2);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMessage, setLoadingMessage] = useState("Loading data...");
  const recordsPerPage = 20;

  const fetchAllUsers = async () => {
    await getAllUsers(
      {
        token: token,
      },
      (response) => {
        const filteredUsers = response.users.filter(
          (us) =>
            us.department?.id === user?.department?.id && us.id !== user.id
        );

        if (filteredUsers.length !== 0) {
          setNoUsers(false);
          setDepartmentUsers(filteredUsers);
          setLoading(true);
        } else {
          setLoading(false);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const fetchTerms = () => {
    const allowedTerm = departmentTypes[user?.department?.classification];
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
        if (filteredTerms.length === 0)
          setLoadingMessage(
            <span className="text-center mt-2">
              <i className="fa-solid fa-face-grin-beam-sweat"></i> No terms have
              been set for your department. For assistance, please reach out to
              the Human Resources Department.
            </span>
          );
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const fetchClearanceStatus = (employee, term) => {
    getAllSWTDs(
      {
        author_id: employee.id,
        token: token,
      },
      (swtdsResponse) => {
        const filteredSWTDs = swtdsResponse.swtds.filter(
          (swtd) => swtd.term.id === term.id
        );

        getClearanceStatus(
          {
            id: employee.id,
            term_id: term.id,
            token: token,
          },
          (clearanceResponse) => {
            setUserClearanceStatus((prevStatus) => ({
              ...prevStatus,
              [employee.id]: {
                ...clearanceResponse,
                id: employee.id,
                employee_id: employee.employee_id,
                firstname: employee.firstname,
                lastname: employee.lastname,
                swtds: filteredSWTDs,
              },
            }));
            setRequiredPoints(clearanceResponse.points.required_points);
          },
          (error) => {
            console.log(
              `Clearance status error for user ${employee.id}:`,
              error.message
            );
          }
        );
      },
      (error) => {
        console.log(`SWTDs error for user ${employee.id}:`, error.message);
      }
    );
  };

  const fetchClearanceStatusForAllUsers = (term) => {
    departmentUsers.forEach((us) => {
      fetchClearanceStatus(us, term);
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

  const handleEmployeeSWTDClick = (id) => {
    navigate(`/dashboard/${id}`);
  };

  //Get Point Standings
  const topUsers = getTopEmployeePoints();

  //Pagination
  const handleFilter = (employeeList, query, status) => {
    return Object.values(employeeList)
      .filter((employee) => {
        const matchesQuery =
          employee.employee_id.includes(query) ||
          employee.firstname.toLowerCase().includes(query.toLowerCase()) ||
          employee.lastname.toLowerCase().includes(query.toLowerCase());

        return matchesQuery;
      })
      .sort((a, b) => {
        const countStatusA = a.swtds.filter(
          (item) => item.validation.status === status
        ).length;
        const countStatusB = b.swtds.filter(
          (item) => item.validation.status === status
        ).length;
        return countStatusB - countStatusA;
      });
  };

  const filteredEmployees = handleFilter(
    userClearanceStatus,
    searchQuery,
    selectedStatus
  );

  const totalRecords = filteredEmployees.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Ensure currentPage does not exceed totalPages
  const currentPageClamped = Math.min(currentPage, totalPages);

  const indexOfLastRecord = currentPageClamped * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const currentRecords = filteredEmployees.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      if (user?.is_staff) navigate("/hr");
      else if (!user?.is_admin && !user?.is_superuser) navigate("/swtd");
      else {
        setLoading(true);
        const fetchData = async () => {
          fetchTerms();
          await fetchAllUsers();
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
    if (
      !noUsers &&
      Object.values(userClearanceStatus).length === departmentUsers.length
    )
      setLoading(false);
  }, [userClearanceStatus, departmentUsers]);
  if (loading)
    return (
      <Row
        className={`${styles.msg} d-flex justify-content-center align-items-center w-100`}>
        <Col></Col>
        <Col className="text-center">
          <div>
            <Spinner className={`me-2`} animation="border" />
          </div>
          {loadingMessage}
        </Col>
        <Col></Col>
      </Row>
    );

  return (
    <Container className="d-flex flex-column justify-content-start align-items-start">
      <Row className="mb-2 w-100">
        <Col>
          <h3 className={styles.label}>Department Head Dashboard</h3>
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

      {/* APPEAR IF HAVE USERS */}
      {!noUsers && (
        <>
          <Row className="w-100 mb-3">
            <Col md="7">
              <Card className={styles.blackCard}>
                <Card.Body>
                  <Row>
                    <Col
                      className={`${styles.cardCol1} d-flex justify-content-center align-items-center flex-column p-2`}
                      md="5">
                      <Row className="text-center">
                        % of employees with required points
                      </Row>
                      <Row className={styles.lackingPercent}>
                        {clearedUsersPercentage ? clearedUsersPercentage : "0"}%
                      </Row>
                      <Row className="w-100">
                        <Col>
                          <ProgressBar
                            className={styles.bar}
                            now={clearedUsersPercentage}
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
                        <Col md={7}>Total Employees</Col>
                        <Col className="text-end">{departmentUsers.length}</Col>
                      </Row>
                      <Row className={`${styles.depStat} w-100 mb-2`}>
                        <Col md={7}>Cleared Employees</Col>
                        <Col className="text-end">{validUsers}</Col>
                      </Row>
                      <Row className={`${styles.depStat} w-100`}>
                        <Col md={7}>Non-Cleared Employees</Col>
                        <Col className="text-end">{lackingUsers}</Col>
                      </Row>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {noUsers === false && terms.length !== 0 && (
              <Col className="flex-row">
                <Row className={styles.swtdStat}>
                  <span>{user?.department?.classification}</span>
                </Row>
                <Row className={`${styles.swtdContent} mb-1`}>
                  <span>{user?.department?.name}</span>
                </Row>
                {/* <span className={styles.swtdStat}>
                  SWTDs Statistics for {selectedTerm?.name}
                </span> */}
                <hr className="m-0 mb-2" style={{ opacity: "1" }} />
                <Row className={styles.filterText}>
                  <Col>Total Pending SWTDs</Col>
                  <Col className="text-end">
                    {topUsers.reduce(
                      (totalPending, user) =>
                        totalPending +
                        user.swtds.filter(
                          (swtd) => swtd.validation.status === "PENDING"
                        ).length,
                      0
                    )}
                  </Col>
                </Row>

                <Row className={styles.filterText}>
                  <Col className={styles.filterText}>
                    Total SWTDs For Revision
                  </Col>
                  <Col className="text-end">
                    {topUsers.reduce(
                      (totalRevision, user) =>
                        totalRevision +
                        user.swtds.filter(
                          (swtd) => swtd.validation.status === "REJECTED"
                        ).length,
                      0
                    )}
                  </Col>
                </Row>
              </Col>
            )}
          </Row>

          <Row className="w-100 mb-3">
            <Col className="text-start" md={7}>
              <InputGroup className={`${styles.searchBar}`}>
                <InputGroup.Text>
                  <i className="fa-solid fa-magnifying-glass"></i>
                </InputGroup.Text>
                <Form.Control
                  type="search"
                  name="searchQuery"
                  placeholder="Search an employee by ID number, firstname, or lastname."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col md="auto">
              <InputGroup className={styles.filterOption}>
                <InputGroup.Text>
                  <i className="fa-solid fa-filter fa-lg"></i>
                </InputGroup.Text>
                <Form.Select
                  name="filter"
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                  }}>
                  <option value="">Sort by...</option>
                  {status.status.map((status, index) => (
                    <option key={index} value={status}>
                      {status === "REJECTED"
                        ? "SWTDs FOR REVISION"
                        : `${status} SWTDs`}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>

          <Row className="w-100">
            {currentRecords.length === 0 ? (
              <span
                className={`${styles.msg} d-flex justify-content-center align-items-center mt-3 mb-3 w-100`}>
                No employees found.
              </span>
            ) : (
              <div className="mb-3">
                <ListGroup className="w-100" variant="flush">
                  <ListGroup.Item className={styles.swtdHeader}>
                    <Row>
                      <Col md={2}>ID No.</Col>
                      <Col>Name</Col>
                      <Col className="text-center" md={2}>
                        Pending SWTDs
                      </Col>
                      <Col className="text-center" md={2}>
                        SWTDs For Revision
                      </Col>
                      <Col className="text-center" md={2}>
                        Points
                      </Col>
                    </Row>
                  </ListGroup.Item>
                </ListGroup>
                <ListGroup>
                  {currentRecords.map((item) => (
                    <ListGroup.Item
                      key={item.employee_id}
                      className={styles.tableBody}
                      onClick={() => handleEmployeeSWTDClick(item.id)}>
                      <Row>
                        <Col md={2}>{item.employee_id}</Col>
                        <Col>
                          {item.firstname} {item.lastname}
                        </Col>
                        <Col className="text-center" md={2}>
                          {
                            item.swtds.filter(
                              (swtd) => swtd.validation.status === "PENDING"
                            ).length
                          }
                        </Col>

                        <Col className="text-center" md={2}>
                          {
                            item.swtds.filter(
                              (swtd) => swtd.validation.status === "REJECTED"
                            ).length
                          }
                        </Col>

                        <Col className="text-center" md={2}>
                          {item.points.valid_points}
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
              <Pagination>
                <Pagination.First
                  className={styles.pageNum}
                  onClick={() => handlePageChange(1)}
                />
                <Pagination.Prev
                  className={styles.pageNum}
                  onClick={() => {
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                />
                {Array.from({ length: totalPages }, (_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    className={styles.pageNum}
                    onClick={() => handlePageChange(index + 1)}>
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  className={styles.pageNum}
                  onClick={() => {
                    if (currentPage < totalPages)
                      handlePageChange(currentPage + 1);
                  }}
                />
                <Pagination.Last
                  className={styles.pageNum}
                  onClick={() => handlePageChange(totalPages)}
                />
              </Pagination>
            </Col>
          </Row>
        </>
      )}

      {/* APPEAR IF NO USERS */}
      {noUsers && (
        <>
          <hr className="w-100" style={{ opacity: "1" }} />
          <span
            className={`${styles.msg} d-flex justify-content-center align-items-center w-100`}>
            No employees in this department yet.
          </span>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
