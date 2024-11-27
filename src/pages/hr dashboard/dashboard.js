import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, DropdownButton, Dropdown, Spinner } from "react-bootstrap"; /* prettier-ignore */
import { getTerms, getAllDepartments } from "../../api/admin"; /* prettier-ignore */
import { getAllMembers } from "../../api/department";

import PercentCard from "../../components/PercentCard";
import { Histogram } from "../../components/Histogram";
import { PieChart } from "../../components/Pie";
import SessionUserContext from "../../contexts/SessionUserContext";
import styles from "./style.module.css";
import { all } from "axios";

const computeClearingData = (members, term) => {
  const percentCleared = Math.round((members.filter((member) => member.clearances.some((clearance) => clearance.term_id === term.id)).length / members.length) * 10000) / 100;
  const percentNotCleared = 100 - percentCleared;

  return { percentCleared, percentNotCleared };
};

const HRDashboard = () => {
  const token = Cookies.get("userToken");
  const { user } = useContext(SessionUserContext);  
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // Pre-requisites
  const [terms, setTerms] = useState([]);
  const [activeBEDTerm, setActiveBEDTerm] = useState(null);
  const [activeCollegeTerm, setActiveCollegeTerm] = useState(null);
  const [activeAdminTerm, setActiveAdminTerm] = useState(null);
  const [academicDepartments, setAcademicDepartments] = useState([]);
  const [nonAcademicDepartments, setNonAcademicDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [colleges, setColleges] = useState([]);

  // Chart/card data states
  const [elemCardData, setElemCardData] = useState({});
  const [JHSCardData, setJHSCardData] = useState({});
  const [SHSCardData, setSHSCardData] = useState({});
  const [academicDepartmentChartData, setAcademicDepartmentChartData] = useState({});
  const [nonAcademicDepartmentChartData, setnonAcademicDepartmentChartData] = useState({});

  useEffect(() => {
    const onLoad = async () => {
      // Fetch terms & departments
      const [allTerms, allDepartments] = await Promise.all([
        getTerms({ token: token }, (response) => response.terms),
        getAllDepartments({ token: token }, (response) => response.departments)
      ]);

      // Assign to states
      setTerms(allTerms);

      const ongoingAcademicYearTerm = allTerms.find(term => term.type === "ACADEMIC YEAR" && term.is_ongoing);
      const ongoingSemesterTerm = allTerms.find(term => term.type === "SEMESTER" && term.is_ongoing);
      const ongoingMidyearterm = allTerms.find(term => term.type === "MIDYEAR" && term.is_ongoing);
      
      setActiveBEDTerm(ongoingAcademicYearTerm ? ongoingAcademicYearTerm : ongoingAcademicYearTerm);
      setActiveAdminTerm(ongoingAcademicYearTerm ? ongoingAcademicYearTerm : ongoingMidyearterm);
      setActiveCollegeTerm(ongoingSemesterTerm ? ongoingSemesterTerm : ongoingMidyearterm);

      setAcademicDepartments(allDepartments.filter((e) => e.level !== "ADMIN & SUPPORT OFFICES"));
      setNonAcademicDepartments(allDepartments.filter((e) => e.level === "ADMIN & SUPPORT OFFICES"));

      setColleges([...new Set(allDepartments.filter((e) => e.level.startswith("COLLEGE")).map(e => e.level))]);
    };

    setLoading(true);
    onLoad();
    setLoading(false);
  }, []);

  //  TODO: Move this to a handle function
  useEffect(() => {
    const onActiveBEDTermChange = async () => {
      const [elemDepartmentMembers, JHSDepartmentMembers, SHSDepartmentMembers] = await Promise.all([
        getAllMembers( { token: token, id: academicDepartments.find(department => department.level === "ELEMENTARY") }, (response) => response.members),
        getAllMembers( { token: token, id: academicDepartments.find(department => department.level === "JUNIOR HIGH SCHOOL") }, (response) => response.members),
        getAllMembers( { token: token, id: academicDepartments.find(department => department.level === "SENIOR HIGH SCHOOL") }, (response) => response.members)
      ]);

      setElemCardData(computeClearingData(elemDepartmentMembers, activeBEDTerm));
      setJHSCardData(computeClearingData(JHSDepartmentMembers, activeBEDTerm));
      setSHSCardData(computeClearingData(SHSDepartmentMembers, activeBEDTerm));
    };

    onActiveBEDTermChange();
  }, [activeBEDTerm]);

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
          Loading data...
        </Col>
        <Col></Col>
      </Row>
    );

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center">
      <Row className="w-100 mb-3">
        <Col>
          <h3 className={`${styles.label} d-flex align-items-center`}>
            Department Summary
          </h3>
        </Col>
      </Row>

      <Row className="w-100">
        <Col lg={4}>
          <PercentCard
            departments={academicDepartments}
            level="ELEMENTARY"
            title="Elementary Department"
            term={activeBEDTerm}
          />
        </Col>

        <Col lg={4}>
          <PercentCard
            departments={academicDepartments}
            level="JUNIOR HIGH SCHOOL"
            title="Junior High School Department"
            term={activeBEDTerm}
          />
        </Col>

        <Col lg={4}>
          <PercentCard
            departments={academicDepartments}
            level="SENIOR HIGH SCHOOL"
            title="Senior High School Department"
            term={activeBEDTerm}
          />
        </Col>
      </Row>

      {/* Histogram Section */}
      <Row className="w-100 mb-3">
      <Col>
          <DropdownButton
            title={selectedLevel || colleges[0] || "Loading..."}
            onSelect={setSelectedLevel()}>
            {colleges.map((level) => (
              <Dropdown.Item key={level} eventKey={level}>
                {level}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </Col>
        <Col>
          <DropdownButton
            title={selectedLevel || levels[0] || "Loading..."}
            onSelect={handleLevelSelect}>
            {levels.map((level) => (
              <Dropdown.Item key={level} eventKey={level}>
                {level}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </Col>
      </Row>

      <Row className="w-100">
        <Col md={8}>
          <Histogram departments={histogramData} term={semesterTerm} />
        </Col>

        {/* Pie Section */}
        <Col md={4}>
          {/* Admin & Academic Support Offices Department Dropdown */}
          <DropdownButton
            title={
              selectedAdminDept ? selectedAdminDept.name : "Select Department"
            }
            onSelect={(deptName) =>
              handleAdminDeptSelect(
                departments.find((dept) => dept.name === deptName)
              )
            }>
            {departments
              .filter(
                (dept) => dept.level === "ADMIN & ACADEMIC SUPPORT OFFICES"
              )
              .map((dept) => (
                <Dropdown.Item key={dept.name} eventKey={dept.name}>
                  {dept.name}
                </Dropdown.Item>
              ))}
          </DropdownButton>

          {/* Pie Chart for Clearance Data */}
          {[].length > 0 ? (
            <PieChart title={`Distribution for ${term ? term.name : 'this term'}`} data={adminChartData} />
          ) : (
            <p>No clearance data available for the selected department.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default HRDashboard;
