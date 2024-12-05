import React, { useState, useEffect } from "react";
import { Form, Row, Col, ListGroup, InputGroup } from "react-bootstrap";
import Cookies from "js-cookie";

// import { userPoints } from "../../api/user";
import { exportPointsOverview } from "../../api/export";
import { getAllUsers } from "../../api/admin";

import { PieChart } from "../../components/Pie";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import PaginationComponent from "../../components/Paging";
import styles from "./style.module.css";

const Overall = ({ departments, terms, faculty }) => {
  const token = Cookies.get("userToken");

  // Page State
  const [isLoading, setIsLoading] = useState(false);

  const [selectedTerm, setSelectedTerm] = useState(-1);
  const [pieChartData, setPieChartData] = useState(null);

  //For filtering
  const recordsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [deps, setDeps] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");

  useEffect(() => {
    const init = async () => {
      const t = terms.find((t) => t.id === selectedTerm);

      await getAllUsers({ token: token }, (response) => {
        const users_ = response.users;

        let departments_ = departments.filter((d) => {
          switch (t.type) {
            case "ACADEMIC YEAR":
              return d.use_schoolyear === true;
            case "SEMESTER":
              return !d.use_schoolyear === true;
            case "MIDYEAR/SUMMER":
              return d.midyear_points !== 0;
            default:
              return true;
          }
        });

        departments_.forEach((d) => {
          const members = users_.filter((u) => u.department?.id === d.id);
          d.members = members;

          const clearedMembers = members.filter(
            (m) => m.clearances?.filter((c) => c.term.id === t.id).length > 0
          );
          const percentCleared =
            members.length === 0
              ? 0
              : Math.round((clearedMembers.length / members.length) * 100);

          d.cleared_member_count = clearedMembers.length;
          d.percent_cleared = percentCleared;
        });

        setDeps(
          departments_.sort(
            (a, b) => -1 * (a.percent_cleared - b.percent_cleared)
          )
        );

        const overallMemberCount = departments_
          .filter((d) =>
            selectedLevel === "" ? true : d.level === selectedLevel
          )
          .map((d) => d.members.length)
          .reduce((acc, value) => acc + value, 0);

        const overAllClearedCount = departments_
          .filter((d) =>
            selectedLevel === "" ? true : d.level === selectedLevel
          )
          .map(
            (d) =>
              d.members.filter((m) =>
                m.clearances?.some((c) => c.term.id === t.id)
              ).length
          )
          .reduce((acc, value) => acc + value, 0);

        const overallPercentCleared =
          overallMemberCount === 0
            ? 0
            : Math.round((overAllClearedCount / overallMemberCount) * 100);

        setPieChartData({
          Cleared: overallPercentCleared,
          "Not Cleared": 100 - overallPercentCleared,
        });
      });
    };

    setIsLoading(true);
    init();
    setIsLoading(false);
  }, [selectedTerm, selectedLevel]);

  const handleFilter = (departments, level, query) => {
    return departments.filter((d) => {
      const matchesQuery =
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.name.toLowerCase().includes(query.toLowerCase());
      const matchesLevel = level ? d.level === level : true;
      return matchesQuery && matchesLevel;
    });
  };

  const filteredDepartments = handleFilter(deps, selectedLevel, searchQuery);

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

  const employeeTotal = deps
    .filter((d) => (selectedLevel === "" ? true : d.level === selectedLevel))
    .map((d) => d.members.length)
    .reduce((acc, value) => acc + value, 0);

  const clearedTotal = deps
    .filter((d) => (selectedLevel === "" ? true : d.level === selectedLevel))
    .map((d) => d.cleared_member_count)
    .reduce((acc, value) => acc + value, 0);

  const levels = [...new Set(deps.map((d) => d.level))];

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
                      Total Number of Employees:{" "}
                      <span className={styles.searchBar}>{employeeTotal}</span>
                    </div>
                    <div className="mb-3">
                      Number of Cleared Employees:{" "}
                      <span className={styles.searchBar}>{clearedTotal}</span>
                    </div>
                  </Col>
                </Row>
              )}
            </Col>

            {/** Employee table */}
            {pieChartData && (
              <Col>
                <Row className="mb-3">
                  {/** Search bar */}
                  <Col>
                    <InputGroup className={`${styles.searchBar}`}>
                      <InputGroup.Text>
                        <i className="fa-solid fa-magnifying-glass"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="search"
                        name="searchQuery"
                        placeholder="Search by Department name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </InputGroup>
                  </Col>

                  <Col>
                    <Form.Select
                      className="mb-3"
                      value={selectedLevel}
                      onChange={(e) => {
                        setSelectedLevel(e.target.value);
                      }}>
                      <option value="">ALL LEVELS</option>
                      {levels
                        .sort((a, b) => a.localeCompare(b))
                        .map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                    </Form.Select>
                  </Col>
                </Row>
                <ListGroup className="w-100" variant="flush">
                  <ListGroup.Item className={styles.tableHeader}>
                    <Row>
                      <Col xs={5}>Name</Col>
                      <Col xs={2}>Cleared</Col>
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
                  {currentRecords.length === 0 ? (
                    <ListGroup.Item>
                      <Row>
                        <Col xs={12} className="d-flex justify-content-center">
                          No records to show.
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ) : (
                    currentRecords
                      .filter((d) =>
                        selectedLevel === "" ? true : d.level === selectedLevel
                      )
                      .map((d) => (
                        <ListGroup.Item key={d?.id}>
                          <Row>
                            <Col xs={5}>{d.name}</Col>
                            <Col className="text-center" xs={2}>
                              {Math.round(
                                d.members.length * (d.percent_cleared / 100)
                              )}
                            </Col>
                            <Col className="text-center" xs={3}>
                              {d.members.length}
                            </Col>
                            <Col className="text-center" xs={2}>
                              {d.percent_cleared}%
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))
                  )}
                </ListGroup>

                {currentRecords.length !== 0 && (
                  <Row className="w-100 mt-3 mb-3">
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
            Select a term to see departmental data.
          </Col>
        )}
      </Row>
    </>
  );
};

export default Overall;
