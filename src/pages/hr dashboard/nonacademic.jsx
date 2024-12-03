import React, { useState, useEffect } from "react";
import { Form, Row, Col, ListGroup, InputGroup } from "react-bootstrap";
import Cookies from "js-cookie";

import { userPoints } from "../../api/user";
import { exportPointsOverview } from "../../api/export";

import { PieChart } from "../../components/Pie";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import PaginationComponent from "../../components/Paging";
import styles from "./style.module.css";

const Nonacademic = ({ departments, terms, faculty }) => {
  const token = Cookies.get("userToken");

  //Filter employees
  const filterMembers = faculty.filter(
    (f) => f.department.level === "ADMIN & ACADEMIC SUPPORT OFFICES"
  );
  const [members, setMembers] = useState(filterMembers);
  const [selectedDepartment, setSelectedDepartment] = useState(-1);
  const [selectedTerm, setSelectedTerm] = useState(-1);

  const [head, setHead] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);

  //For filtering
  const recordsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(-1);

  const handlePrint = () => {
    exportPointsOverview(
      {
        id: selectedDepartment,
        term_id: selectedTerm,
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

  const fetchPoints = async (member, term) => {
    await userPoints(
      {
        id: member?.id,
        term_id: term,
        token: token,
      },
      (response) => {
        setMembers((prevMembers) =>
          prevMembers.map((m) =>
            m.id === member.id
              ? {
                  ...m,
                  points: response.data.points,
                }
              : m
          )
        );
      },
      (error) => console.log(error)
    );
  };

  useEffect(() => {
    if (selectedTerm === -1 || selectedDepartment === -1) {
      setPieChartData(null);
      return;
    }

    const filteredMembers = members.filter(
      (member) => member.department.id === selectedDepartment
    );

    if (filteredMembers.length === 0) {
      setPieChartData(null);
      return;
    }

    filteredMembers.forEach((member) => fetchPoints(member, selectedTerm));

    const compute = async () => {
      const clearedCount = filteredMembers.filter((emp) =>
        emp.clearances.some(
          (clearance) =>
            clearance.term.id === selectedTerm && !clearance.is_deleted
        )
      ).length;
      const percentCleared =
        Math.round((clearedCount / filteredMembers.length) * 10000) / 100;

      setPieChartData({
        "Cleared Employees": percentCleared,
        "Non Cleared Employees": 100 - percentCleared,
      });
    };

    compute();
  }, [selectedTerm, selectedDepartment]);

  const handleFilter = (employeeList, query, dept, term, statusFilter) => {
    return employeeList.filter((employee) => {
      const matchesQuery =
        employee.firstname.toLowerCase().includes(query.toLowerCase()) ||
        employee.lastname.toLowerCase().includes(query.toLowerCase());

      const matchesDept = dept !== -1 ? employee.department?.id === dept : true;
      const matchesStatus =
        statusFilter === 1
          ? employee.clearances.some(
              (clearance) => clearance.term.id === term && !clearance.is_deleted
            )
          : statusFilter === 0
          ? !employee.clearances.some(
              (clearance) => clearance.term.id === term && !clearance.is_deleted
            )
          : true;

      return matchesQuery && matchesDept && matchesStatus;
    });
  };

  const filteredEmployees = handleFilter(
    members,
    searchQuery,
    selectedDepartment,
    selectedTerm,
    statusFilter
  );

  const totalRecords = filteredEmployees.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
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

  return (
    <>
      <Row className={`${styles.searchBar} w-100`}>
        {/** Office dropdown */}
        <Col lg={8}>
          <Form.Select
            className="mb-3"
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(parseInt(e.target.value, 10));
              setMembers(filterMembers);
            }}>
            <option value={-1}>Select office</option>
            {departments.map((dept) => (
              <option key={dept?.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/** Term dropdown */}
        <Col>
          <Form.Select
            className="mb-3"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(parseInt(e.target.value, 10))}
            disabled={selectedDepartment === -1}>
            <option value={-1}>Select term</option>
            {terms.map((term) => (
              <option key={term?.id} value={term?.id}>
                {term.name}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Row>
        <hr className="w-100" />
      </Row>

      <Row>
        {pieChartData && (
          <>
            <Col className="mb-3">
              <Row>
                {/** Search bar */}
                <Col lg={8}>
                  <InputGroup className={`${styles.searchBar}`}>
                    <InputGroup.Text>
                      <i className="fa-solid fa-magnifying-glass"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="search"
                      name="searchQuery"
                      placeholder="Search by firstname or lastname..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                </Col>

                {/** Status dropdown */}
                <Col>
                  <InputGroup className={`${styles.searchBar}`}>
                    <InputGroup.Text>
                      <i className="fa-solid fa-tag"></i>
                    </InputGroup.Text>
                    <Form.Select
                      name="status"
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(parseInt(e.target.value, 10))
                      }>
                      <option value={-1}>Filter by status</option>
                      <option value={1}>CLEARED</option>
                      <option value={0}>NOT CLEARED</option>
                    </Form.Select>
                  </InputGroup>
                </Col>
              </Row>
            </Col>
          </>
        )}
      </Row>

      <Row>
        {selectedTerm !== -1 ? (
          <>
            <Col lg={4}>
              {/** Pie chart */}
              {pieChartData && (
                <Row className="flex-row">
                  <Col className="mb-3">
                    <PieChart label={"Pie Chart"} data={pieChartData} />
                  </Col>

                  <Col className={styles.semibold}>
                    {/* <div>
                      Department Head/Chair:{" "}
                      <span className={styles.searchBar}></span>
                    </div> */}
                    <div>
                      Total Employees:{" "}
                      <span className={styles.searchBar}>
                        {
                          members.filter(
                            (member) =>
                              member?.department?.id ===
                              parseInt(selectedDepartment)
                          ).length
                        }
                      </span>
                    </div>
                    <div className="mb-3">
                      Cleared Employees:{" "}
                      <span className={styles.searchBar}>
                        {pieChartData["Cleared Employees"]?.toFixed(0)}%
                      </span>
                    </div>

                    <BtnSecondary
                      onClick={handlePrint}
                      disabled={
                        selectedDepartment === -1 || selectedTerm === -1
                      }>
                      <i className="fa-solid fa-file-arrow-down fa-lg me-2"></i>{" "}
                      Export
                    </BtnSecondary>
                  </Col>
                </Row>
              )}
            </Col>

            {/** Employee table */}
            {pieChartData && (
              <Col>
                <ListGroup className="w-100" variant="flush">
                  <ListGroup.Item className={styles.tableHeader}>
                    <Row>
                      <Col lg={2} md={1} xs={2}>
                        ID
                      </Col>
                      <Col lg={6} md={7} xs={5}>
                        Name
                      </Col>
                      <Col className="text-center" lg={2} md={1} xs={2}>
                        Points
                      </Col>
                      <Col className="text-center" lg={2} md={2} xs={3}>
                        Status
                      </Col>
                    </Row>
                  </ListGroup.Item>
                </ListGroup>
                <ListGroup className={`${styles.searchBar} w-100`}>
                  {currentRecords.length === 0 ?
                  <ListGroup.Item>
                    <Row>
                      <Col xs={12} className="d-flex justify-content-center">
                        No records to show.
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  :
                  currentRecords.map((member) => (
                    <ListGroup.Item key={member?.id}>
                      <Row>
                        <Col lg={2} md={1} xs={2}>
                          {member?.employee_id}
                        </Col>
                        <Col lg={6} md={7} xs={5}>
                          {member.firstname} {member.lastname}
                        </Col>
                        <Col className="text-center" lg={2} md={1} xs={2}>
                          0
                        </Col>
                        <Col className="text-center" lg={2} md={2} xs={3}>
                          {member.clearances?.find(
                            (clear) =>
                              clear.term?.id === selectedTerm &&
                              !clear.is_deleted
                          ) ? (
                            <span className="text-success">CLEARED</span>
                          ) : (
                            <span className="text-danger">NOT CLEARED</span>
                          )}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>

                {currentRecords.length !== 0 && (
                  <Row className="w-100 mt-3">
                    <Col className="d-flex justify-content-center">
                      <PaginationComponent
                        totalPages={totalPages}
                        currentPage={currentPage}
                        handlePageChange={handlePageChange}
                      />
                    </Col>
                  </Row>
                )}
              </Col>
            )}
            {!pieChartData && (
              <Row className={`w-100`}>
                <Col className={`${styles.searchBar} text-center`}>
                  No clearance data available for the selected office.
                </Col>
              </Row>
            )}
          </>
        ) : (
          <Col className={`${styles.searchBar} text-center`}>
            Select the level, department, and term to see data.
          </Col>
        )}
      </Row>
    </>
  );
};

export default Nonacademic;
