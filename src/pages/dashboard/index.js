import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup, Spinner, Card, ProgressBar, Dropdown, DropdownButton } from "react-bootstrap"; /* prettier-ignore */

import status from "../../data/status.json";
import { getAllMembers } from "../../api/department";
import { getTerms } from "../../api/admin";
import { getClearanceStatus } from "../../api/user";
import { getAllSWTDs } from "../../api/swtd";
import { exportDepartmentData } from "../../api/export";
import SessionUserContext from "../../contexts/SessionUserContext";

import PaginationComponent from "../../components/Paging";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import styles from "./style.module.css";

const Dashboard = () => {
  const token = Cookies.get("userToken");
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 762);

  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [noUsers, setNoUsers] = useState(true);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [departmentTypes, setDepartmentTypes] = useState({
    semester: false,
    midyear: false,
    academic: false,
  });
  const [selectedStatus, setSelectedStatus] = useState("");
  const [userClearanceStatus, setUserClearanceStatus] = useState([]);
  const lackingUsers = Object.values(userClearanceStatus).filter(
    (status) => status.is_cleared === false
  ).length;

  const validUsers = Object.values(userClearanceStatus).filter(
    (status) => status.is_cleared === true
  ).length;

  const clearedUsersPercentage = (
    (validUsers / departmentUsers.length) *
    100
  ).toFixed(0);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 762);
  };

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMessage, setLoadingMessage] = useState("Loading data...");
  const recordsPerPage = 20;

  const fetchDepartmentMembers = async () => {
    await getAllMembers(
      {
        id: user?.department.id,
        token: token,
      },
      (response) => {
        if (response.data.members?.length > 1) {
          setNoUsers(false);
          setDepartmentUsers(
            response.data.members?.filter((member) => member.id !== user.id)
          );
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
    getTerms(
      {
        token: token,
      },
      (response) => {
        let filteredTerms = response.terms;
        if (filteredTerms?.length === 0)
          setLoadingMessage(
            <span className="text-center mt-2">
              <i className="fa-solid fa-face-grin-beam-sweat"></i> No terms have
              been set for your department. For assistance, please reach out to
              the Human Resources Department.
            </span>
          );

        const validTypes = [
          ...(departmentTypes.semester ? ["SEMESTER"] : []),
          ...(departmentTypes.midyear ? ["MIDYEAR/SUMMER"] : []),
          ...(departmentTypes.academic ? ["ACADEMIC YEAR"] : []),
        ];

        if (validTypes.length > 0) {
          filteredTerms = filteredTerms?.filter((term) =>
            validTypes.includes(term.type)
          );
        }

        const ongoingTerm = filteredTerms?.find(
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

  const fetchClearanceStatus = (employee, term) => {
    if (!employee || !term) return;
    getAllSWTDs(
      {
        author_id: employee?.id,
        token: token,
      },
      (response) => {
        const filteredSWTDs = response.swtd_forms?.filter(
          (swtd) => swtd.term?.id === term?.id
        );

        const termStatus = employee?.clearances?.find(
          (clearance) =>
            clearance?.term?.id === term?.id && !clearance.is_deleted
        );

        let isCleared = false;
        if (termStatus) isCleared = true;
        else isCleared = false;

        getClearanceStatus(
          {
            id: employee?.id,
            term_id: term.id,
            token: token,
          },
          (clearanceResponse) => {
            setUserClearanceStatus((prevStatus) => ({
              ...prevStatus,
              [employee?.id]: {
                ...clearanceResponse.points,
                id: employee?.id,
                employee_id: employee.employee_id,
                firstname: employee.firstname,
                lastname: employee.lastname,
                is_cleared: isCleared,
                swtds: filteredSWTDs,
              },
            }));
          },
          (error) => {
            console.log(error.message);
          }
        );
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const fetchClearanceStatusForAllUsers = (term) => {
    departmentUsers?.forEach((member) => {
      fetchClearanceStatus(member, term);
    });
  };

  const handleEmployeeSWTDClick = (id) => {
    navigate(`/dashboard/${id}`);
  };

  const handlePrint = () => {
    exportDepartmentData(
      {
        id: user?.department?.id,
        term_id: selectedTerm.id,
        token: token,
      },
      (response) => {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const blobURL = URL.createObjectURL(blob);
        window.open(blobURL, "_blank");
      },
      (error) => {
        console.log(error);
      }
    );
  };

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
      .filter((stat) => {
        if (!status) return true;

        const countStatus = stat.swtds?.filter(
          (item) => item.validation_status === status
        ).length;

        return countStatus > 0;
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
      else if (user?.is_superuser) navigate("/admin");
      else if (!user?.is_head) navigate("/swtd");
      else if (user?.department) {
        setLoading(true);
        setDepartmentTypes({
          ...departmentTypes,
          semester: user?.department?.use_schoolyear === false,
          midyear: user?.department?.midyear_points > 0,
          academic: user?.department?.use_schoolyear,
        });
        fetchDepartmentMembers();
      } else navigate("/swtd");
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (departmentTypes) fetchTerms();
  }, [departmentTypes]);

  useEffect(() => {
    if (departmentUsers && departmentUsers.length > 0) {
      fetchClearanceStatusForAllUsers(selectedTerm);
    }
  }, [departmentUsers, selectedTerm]);

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
        className={`${styles.msg} d-flex flex-column justify-content-center align-items-center w-100`}
        style={{ height: "100vh" }}>
        <Col></Col>
        <Col className="text-center">
          <div>
            <Spinner animation="border" />
          </div>
          {loadingMessage}
        </Col>
        <Col></Col>
      </Row>
    );

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center">
      <Row className="w-100">
        <Col className="mb-lg-2 mb-0">
          <h3 className={styles.label}>Department Head Dashboard</h3>
        </Col>
        <Col
          className={`${styles.employeeDetails} d-flex align-items-center mb-3 `}
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

      {!noUsers ? (
        <>
          <Row className="w-100 mb-3">
            <Col className="mb-lg-3 mb-md-3 mb-3" lg={7} md={7}>
              <Card className={styles.blackCard}>
                <Card.Body>
                  <Row>
                    <Col
                      className={`${styles.cardCol1} d-flex justify-content-center align-items-center flex-column p-2`}
                      lg={5}
                      md={12}>
                      <Row className="text-center">% of cleared employees</Row>
                      <Row className={styles.lackingPercent}>
                        {isNaN(clearedUsersPercentage)
                          ? "0"
                          : clearedUsersPercentage}
                        %
                      </Row>
                      <Row className="w-100">
                        <Col className="mb-2">
                          <ProgressBar
                            className={styles.bar}
                            now={clearedUsersPercentage}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col className={`${styles.depCol}`}>
                      <span className={`${styles.depTitle}`}>
                        Department Statistics
                      </span>
                      <hr className="m-0 mb-3" style={{ opacity: "1" }} />
                      <Row className={`${styles.depStat} w-100`}>
                        <Col
                          className="mb-lg-2 mb-md-2 mb-1"
                          lg={10}
                          md={10}
                          xs={11}>
                          Total Employees
                        </Col>
                        <Col
                          className="mb-lg-2 mb-md-2 mb-1 text-end"
                          lg={2}
                          md={2}
                          xs={1}>
                          {departmentUsers?.length}
                        </Col>
                      </Row>
                      <Row className={`${styles.depStat} w-100`}>
                        <Col
                          className="mb-lg-2 mb-md-2 mb-1"
                          lg={10}
                          md={10}
                          xs={11}>
                          Cleared Employees
                        </Col>
                        <Col
                          className="mb-lg-2 mb-md-2 mb-1 text-end"
                          lg={2}
                          md={2}
                          xs={1}>
                          {validUsers}
                        </Col>
                      </Row>
                      <Row className={`${styles.depStat} w-100`}>
                        <Col
                          className="mb-lg-2 mb-md-2 mb-1"
                          lg={10}
                          md={10}
                          xs={11}>
                          Non-Cleared Employees
                        </Col>
                        <Col
                          className="mb-lg-2 mb-md-2 mb-1 text-end"
                          lg={2}
                          md={2}
                          xs={1}>
                          {lackingUsers}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col className="mb-lg-3 mb-md-3 mb-3">
              <Row className={styles.swtdStat}>
                <span>{user?.department?.level}</span>
              </Row>
              <Row className={`${styles.swtdContent} mb-1`}>
                <span>{user?.department?.name}</span>
              </Row>
              <hr className="m-0 mb-2" style={{ opacity: "1" }} />
              <Row className={styles.filterText}>
                <Col lg={6} md={10} xs={8}>
                  Total Pending SWTDs
                </Col>
                <Col className="text-end">
                  {Object.values(userClearanceStatus).reduce(
                    (totalPending, user) =>
                      totalPending +
                      user.swtds?.filter(
                        (swtd) => swtd.validation_status === "PENDING"
                      ).length,
                    0
                  )}
                </Col>
              </Row>
              <Row className={styles.filterText}>
                <Col lg={6} md={10} xs={8}>
                  Total SWTDs For Revision
                </Col>
                <Col className="text-end">
                  {Object.values(userClearanceStatus).reduce(
                    (totalPending, user) =>
                      totalPending +
                      user.swtds?.filter(
                        (swtd) => swtd.validation_status === "REJECTED"
                      ).length,
                    0
                  )}
                </Col>
              </Row>
            </Col>
          </Row>

          <Row className="w-100">
            <Col className="mb-lg-3 mb-md-3 mb-2" lg={6} md={6} xs={12}>
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

            <Col className="mb-lg-3 mb-md-3 mb-2" lg={3} md={3} xs={12}>
              <InputGroup className={styles.filterOption}>
                <InputGroup.Text>
                  <i className="fa-solid fa-filter fa-lg"></i>
                </InputGroup.Text>
                <Form.Select
                  name="filter"
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                  }}>
                  <option value="">All Statuses</option>
                  {status.status
                    .filter((s) => s !== "APPROVED")
                    .map((status, index) => (
                      <option key={index} value={status}>
                        {status === "REJECTED"
                          ? "SWTDs FOR REVISION"
                          : `${status} SWTDs`}
                      </option>
                    ))}
                </Form.Select>
              </InputGroup>
            </Col>

            <Col className="mb-lg-3 mb-md-3 mb-2 text-end">
              <BtnSecondary
                onClick={handlePrint}
                disabled={departmentUsers.length === 0}>
                <i className="fa-solid fa-file-arrow-down me-2"></i>
                Export
              </BtnSecondary>
            </Col>
          </Row>

          {currentRecords.length === 0 ? (
            <span
              className={`${styles.msg} d-flex justify-content-center align-items-center mt-3 mb-3 w-100`}>
              {departmentUsers.length === 0
                ? "No employees found."
                : "No records found."}
            </span>
          ) : (
            <>
              {!isMobile && (
                <ListGroup className="w-100" variant="flush">
                  <ListGroup.Item className={styles.swtdHeader}>
                    <Row>
                      <Col lg={1} md={2}>
                        ID No.
                      </Col>
                      <Col lg={4} md={2}>
                        Name
                      </Col>

                      <Col className="text-center" lg={2} md={2}>
                        {!selectedStatus || selectedStatus === "PENDING"
                          ? "Pending SWTDs"
                          : ""}
                      </Col>

                      <Col className="text-center" lg={2} md={3}>
                        {!selectedStatus || selectedStatus === "REJECTED"
                          ? "SWTDs For Revision"
                          : ""}
                      </Col>

                      <Col className="text-center" lg={1} md={1}>
                        Points
                      </Col>
                      <Col className="text-center" lg={2} md={2}>
                        Status
                      </Col>
                    </Row>
                  </ListGroup.Item>
                </ListGroup>
              )}
              <ListGroup className="w-100">
                {currentRecords.map((item) => (
                  <ListGroup.Item
                    key={item.employee_id}
                    className={`${styles.tableBody} mb-lg-0 mb-md-0 mb-2`}
                    onClick={() => handleEmployeeSWTDClick(item.id)}>
                    <Row>
                      <Col className="mb-lg-0 mb-md-0 mb-1" lg={1} md={2}>
                        {isMobile && (
                          <span className={styles.formLabel}>ID: </span>
                        )}
                        {item.employee_id}
                      </Col>
                      <Col className="mb-lg-0 mb-md-0 mb-1" lg={4} md={2}>
                        {isMobile && (
                          <span className={styles.formLabel}>Name: </span>
                        )}
                        {item.firstname} {item.lastname}
                      </Col>

                      <Col
                        className="mb-lg-0 mb-md-0 mb-1 text-lg-center text-md-center"
                        lg={2}
                        md={2}>
                        {isMobile && (
                          <span className={styles.formLabel}>
                            Pending SWTDs:{" "}
                          </span>
                        )}

                        {!selectedStatus || selectedStatus === "PENDING"
                          ? item.swtds?.filter(
                              (swtd) => swtd.validation_status === "PENDING"
                            ).length
                          : ""}
                      </Col>

                      <Col
                        className="mb-lg-0 mb-md-0 mb-1 text-lg-center text-md-center"
                        lg={2}
                        md={3}>
                        {isMobile && (
                          <span className={styles.formLabel}>
                            SWTDs for Revision:{" "}
                          </span>
                        )}
                        {!selectedStatus || selectedStatus === "REJECTED"
                          ? item.swtds?.filter(
                              (swtd) => swtd.validation_status === "REJECTED"
                            ).length
                          : ""}
                      </Col>
                      <Col
                        className="mb-lg-0 mb-md-0 mb-1 text-lg-center text-md-center"
                        lg={1}
                        md={1}>
                        {isMobile && (
                          <span className={styles.formLabel}>Points: </span>
                        )}
                        {item.valid_points}
                      </Col>
                      <Col
                        className={`mb-lg-0 mb-md-0 mb-1 text-${
                          item.is_cleared ? "success" : "danger"
                        } ${styles.filterText} text-lg-center text-md-center`}
                        lg={2}
                        md={2}>
                        {item.is_cleared ? "CLEARED" : "NOT CLEARED"}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <Row className="w-100 mt-3 mb-3">
                <Col className="d-flex justify-content-center">
                  <PaginationComponent
                    totalPages={totalPages}
                    currentPage={currentPage}
                    handlePageChange={handlePageChange}
                  />
                </Col>
              </Row>
            </>
          )}
        </>
      ) : (
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
