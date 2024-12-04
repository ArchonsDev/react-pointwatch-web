import React, { useState, useEffect } from "react";
import { Form, Row, Col, ListGroup, InputGroup } from "react-bootstrap";
import Cookies from "js-cookie";

import { userPoints } from "../../api/user";
import { exportPointsOverview } from "../../api/export";
import { getAllUsers} from "../../api/admin";

import { PieChart } from "../../components/Pie";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import PaginationComponent from "../../components/Paging";
import styles from "./style.module.css";

const Overall = ({ departments, terms, faculty }) => {
  const token = Cookies.get("userToken");

  // Page State
  const [isLoading, setIsLoading] = useState(false);

  //Get all unique levels
  const levels = [
    ...new Set(departments.map((department) => department.level)),
  ];

  const [members, setMembers] = useState(faculty);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(-1);
  const [selectedTerm, setSelectedTerm] = useState(-1);
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [head, setHead] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);

  //For filtering
  const recordsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(-1);

  const [deps, setDeps] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [tableData, setTableData] = useState({});

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
    const init = async () => {
      const t = terms.find((t) => t.id === selectedTerm);

      await getAllUsers(
        { token: token },
        (response) => {
          const users_ = response.users;

          setUserCount(users_.length);

          let departments_ = departments.filter(d => {
            switch (t.type) {
              case "ACADEMIC YEAR":
                return d.use_schoolyear === true && d.midyear_points !== 0;
              case "SEMESTER":
                return !(d.use_schoolyear) === true && d.midyear_points !== 0;
            }
          });

          departments_.forEach(d => {
            const members = users_.filter(u => u.department?.id === d.id);
            d.members = members;

            const clearedMembers = members.filter(m => m.clearances?.filter(c => c.term.id === t.id));
            const percentCleared = Math.round((clearedMembers.length / users_.length) * 100);

            d.percent_cleared = percentCleared;
          });

          setDeps(departments_.sort((a, b) => -1 * (a.percent_cleared - b.percent_cleared)));

          const overallPercentCleared = departments_.map(d => d.percent_cleared).reduce((acc, value) => acc + value);

          setPieChartData({
            "Cleared": overallPercentCleared,
            "Not Cleared": 100 - overallPercentCleared
          })
        }
      );
    };

    setIsLoading(true);
    init();
    setIsLoading(false);
  }, [selectedTerm]);

  // useEffect(() => {
  //   if (selectedDepartment !== -1) {
  //     const dep = departments.find((dept) => dept.id === selectedDepartment);
  //     const depTerms = terms.filter((term) => {
  //       const { use_schoolyear, midyear_points } = dep;
  //       if (term.type === "ACADEMIC YEAR" && use_schoolyear) return true;
  //       if (term.type === "SEMESTER" && !use_schoolyear) return true;
  //       if (term.type === "MIDYEAR/SUMMER" && midyear_points > 0) return true;

  //       return false;
  //     });

  //     // const findHead = members.find((member) => member.id === dep?.head_id);
  //     setFilteredTerms(depTerms);
  //   }
  // }, [selectedDepartment]);

  // useEffect(() => {
  //   if (selectedTerm === -1 || selectedDepartment === -1) {
  //     setPieChartData(null);
  //     return;
  //   }

  //   const filteredMembers = members.filter(
  //     (member) => member.department.id === selectedDepartment
  //   );

  //   if (filteredMembers.length === 0) {
  //     setPieChartData(null);
  //     return;
  //   }

  //   filteredMembers.forEach((member) => fetchPoints(member, selectedTerm));

  //   const compute = async () => {
  //     const clearedCount = filteredMembers.filter((emp) =>
  //       emp.clearances.some(
  //         (clearance) =>
  //           clearance.term.id === selectedTerm && !clearance.is_deleted
  //       )
  //     ).length;
  //     const percentCleared =
  //       Math.round((clearedCount / filteredMembers.length) * 10000) / 100;

  //     setPieChartData({
  //       "Cleared Employees": percentCleared,
  //       "Non Cleared Employees": 100 - percentCleared,
  //     });
  //   };

  //   compute();
  // }, [selectedTerm, selectedDepartment]);

  const handleFilter = (departments, query) => {
    return departments.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()) || d.name.toLowerCase().includes(query.toLowerCase()));
  };

  const filteredDepartments = handleFilter(deps, searchQuery);

  const totalRecords = filteredDepartments.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const currentPageClamped = Math.min(currentPage, totalPages);
  const indexOfLastRecord = currentPageClamped * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredDepartments.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Row className={`${styles.searchBar} w-100`}>
        {/** Term dropdown */}
        <Col>
          <Form.Select
            className="mb-3"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(parseInt(e.target.value, 10))}>
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
                      <Col xs={5}>
                        Name
                      </Col>
                      <Col xs={2}>
                        Cleared
                      </Col>
                      <Col className="text-center" xs={3}>
                        Population
                      </Col>
                      <Col className="text-center" xs={2}>
                        % Cleared
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
                  currentRecords.map((d) => (
                    <ListGroup.Item key={d?.id}>
                      <Row>
                        <Col xs={5}>
                          {d.name}
                        </Col>
                        <Col className="text-center" xs={2}>
                          {Math.round(d.members.length * (d.percent_cleared / 100))}
                        </Col>
                        <Col className="text-center" xs={3}>
                          {d.members.length}
                        </Col>
                        <Col className="text-center" xs={2}>
                          {d.percent_cleared}%
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
                  No clearance data available for the selected department.
                </Col>
              </Row>
            )}
          </>
        ) : (
          <Col className={`${styles.searchBar} text-center`}>
            Select the level, department, and term to see departmental data.
          </Col>
        )}
      </Row>
    </>
  );
};

export default Overall;
