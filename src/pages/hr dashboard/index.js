import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup, Spinner, Pagination } from "react-bootstrap"; /* prettier-ignore */

import departments from "../../data/departments.json";
import departmentTypes from "../../data/departmentTypes.json";
import { getAllUsers, getTerms } from "../../api/admin";
import { getClearanceStatus } from "../../api/user";
import SessionUserContext from "../../contexts/SessionUserContext";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import styles from "./style.module.css";

const HRDashboard = () => {
  const token = Cookies.get("userToken");
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();

  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [terms, setTerms] = useState([]);
  const [departmentTerms, setDepartmentTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [userClearanceStatus, setUserClearanceStatus] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  const fetchAllUsers = async () => {
    await getAllUsers(
      {
        token: token,
      },
      (response) => {
        const employees = response.users.filter(
          (us) => us.id !== user.id && !us.is_superuser
        );
        setDepartmentUsers(employees);
        setLoading(false);
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
        setTerms(response.terms);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const fetchClearanceStatus = (employee, term) => {
    getClearanceStatus(
      {
        id: employee.id,
        term_id: term,
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
            department: employee.department,
          },
        }));
      },
      (error) => {
        console.log(
          `Clearance status error for user ${employee.id}:`,
          error.message
        );
      }
    );
  };

  const fetchClearanceStatusForAllUsers = (term) => {
    departmentUsers.forEach((us) => {
      fetchClearanceStatus(us, term);
    });
  };

  const handleEmployeeSWTDClick = (id) => {
    navigate(`/dashboard/${id}`);
  };

  //Pagination
  const handleFilter = (employeeList, query, dept) => {
    return Object.values(employeeList).filter((employee) => {
      const matchesQuery =
        employee.employee_id.includes(query) ||
        employee.firstname.toLowerCase().includes(query.toLowerCase()) ||
        employee.lastname.toLowerCase().includes(query.toLowerCase());

      const matchesDept = dept ? employee.department === dept : true;

      return matchesQuery && matchesDept;
    });
  };

  const filteredEmployees = handleFilter(
    userClearanceStatus,
    searchQuery,
    selectedDepartment
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
      if (user?.is_admin) navigate("/dashboard");
      else if (!user?.is_staff && !user?.is_superuser) navigate("/swtd");
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
    const allowedTerm = departmentTypes[selectedDepartment];
    const filteredTerms = terms?.filter((term) =>
      allowedTerm?.includes(term.type)
    );
    setDepartmentTerms(filteredTerms);
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedTerm) {
      fetchClearanceStatusForAllUsers(selectedTerm);
    }
  }, [selectedTerm]);

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
      <Row className="w-100">
        <Col>
          <h3 className={styles.pageTitle}>Departmental Points Overview</h3>
        </Col>
      </Row>

      <Row className="mb-3">
        <span className={`${styles.deptDropdown} text-muted`}>
          Select a department and term below to see the records of employees.
        </span>
      </Row>

      <Row className="w-100">
        {/* SEARCH BAR */}
        <Col className="text-start" md="5">
          <InputGroup className={`${styles.searchBar} mb-3`}>
            <InputGroup.Text>
              <i className="fa-solid fa-magnifying-glass"></i>
            </InputGroup.Text>
            <Form.Control
              type="search"
              name="searchQuery"
              placeholder="Search by ID number, firstname, or lastname."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>

        {/* DEPARTMENTS */}
        <Col md="auto">
          <InputGroup className={`${styles.searchBar} mb-3`}>
            <InputGroup.Text>
              <i className="fa-solid fa-landmark fa-lg"></i>
            </InputGroup.Text>
            <Form.Select
              value={selectedDepartment}
              className={styles.deptDropdown}
              onChange={(e) => setSelectedDepartment(e.target.value)}>
              <option value="" disabled>
                Select department
              </option>
              {departments.departments.map((department, idx) => (
                <option key={idx} value={department}>
                  {department}
                </option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>

        {/* TERMS */}
        <Col>
          <InputGroup className={`${styles.searchBar} mb-3`}>
            <InputGroup.Text>
              <i className="fa-regular fa-calendar fa-lg"></i>
            </InputGroup.Text>
            <Form.Select
              value={selectedTerm}
              className={styles.deptDropdown}
              onChange={(e) => {
                setSelectedTerm(e.target.value);
              }}
              disabled={!selectedDepartment}>
              <option value="" disabled>
                Select term
              </option>
              {departmentTerms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                </option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>

        <Col md="auto">
          <BtnPrimary
            onClick={() => {
              setSelectedDepartment("");
              setSelectedTerm("");
            }}>
            <i className="fa-solid fa-trash-can me-2"></i>Reset
          </BtnPrimary>
        </Col>
      </Row>

      {!selectedDepartment && !selectedTerm && (
        <hr className="w-100" style={{ opacity: "1" }} />
      )}

      {selectedDepartment && selectedTerm && (
        <>
          <Row className="w-100">
            {currentRecords.length === 0 ? (
              <span
                className={`${styles.msg} d-flex justify-content-center align-items-center mt-3 mb-3 w-100`}>
                No employees found.
              </span>
            ) : (
              <div className="mb-3">
                <ListGroup className="w-100" variant="flush">
                  <ListGroup.Item className={styles.tableHeader}>
                    <Row>
                      <Col md={2}>ID No.</Col>
                      <Col>Name</Col>
                      <Col md={2}>Department</Col>
                      {selectedDepartment && (
                        <Col className="text-center" md={2}>
                          Points
                        </Col>
                      )}
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
                        <Col md={2}>{item.department}</Col>
                        {selectedDepartment && (
                          <Col className="text-center" md={2}>
                            {item.points.valid_points}
                          </Col>
                        )}
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
          </Row>

          {/* PAGINATION */}
          {currentRecords.length !== 0 && (
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
          )}
        </>
      )}
    </Container>
  );
};

export default HRDashboard;
