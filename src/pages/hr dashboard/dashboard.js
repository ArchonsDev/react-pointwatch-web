import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, DropdownButton, Dropdown, Spinner } from "react-bootstrap"; /* prettier-ignore */
import { getTerms, getAllDepartments } from "../../api/admin"; /* prettier-ignore */
import PercentCard from "../../components/PercentCard";
import { Histogram } from "../../components/Histogram";
import { PieChart } from "../../components/Pie";
import SessionUserContext from "../../contexts/SessionUserContext";
import styles from "./style.module.css";

const HRDashboard = () => {
  const token = Cookies.get("userToken");
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();
  const [semesterTerm, setSemesterTerm] = useState(null);
  const [schoolTerm, setSchoolTerm] = useState(null);
  const [midTerm, setMidTerm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null); // State for selected level
  const [histogramData, setHistogramData] = useState([]); // Data for histogram
  const [adminSupportData] = useState([
    { label: "Admin", value: 30 },
    { label: "Support", value: 70 },
  ]);

  // New states for pie chart dropdown and clearance data
  const [selectedAdminDept, setSelectedAdminDept] = useState(null); // Selected department for pie chart
  const [clearanceData, setClearanceData] = useState([]); // Data for clearance status (granted or not)

  const excludedLevels = [
    "ELEMENTARY DEPARTMENT",
    "JUNIOR HIGH SCHOOL DEPARTMENT",
    "SENIOR HIGH SCHOOL DEPARTMENT",
    "ADMIN & ACADEMIC SUPPORT OFFICES",
  ];

  const fetchTerms = () => {
    getTerms(
      { token },
      (response) => {
        const terms = response.terms;
        const currentTerms = {
          SEMESTER: null,
          "ACADEMIC YEAR": null,
          "MIDYEAR/SUMMER": null,
        };
        terms.forEach((term) => {
          if (term.is_ongoing && currentTerms.hasOwnProperty(term.type))
            currentTerms[term.type] = term;
        });

        setSemesterTerm(currentTerms.SEMESTER);
        setSchoolTerm(currentTerms["ACADEMIC YEAR"]);
        setMidTerm(currentTerms["MIDYEAR/SUMMER"]);
        setLoading(false);
      },
      (error) => {
        console.error(error.message);
        setLoading(false);
      }
    );
  };

  const fetchDepartments = () => {
    getAllDepartments(
      { token },
      (response) => {
        setDepartments(response.departments);
        const uniqueLevels = [
          ...new Set(
            response.departments
              .map((dept) => dept.level)
              .filter((level) => !excludedLevels.includes(level))
          ),
        ];
        setLevels(uniqueLevels);

        // Filter departments for ADMIN & ACADEMIC SUPPORT OFFICES
        const adminDept = response.departments.filter(
          (dept) => dept.level === "ADMIN & ACADEMIC SUPPORT OFFICES"
        );
        // Set the first department as the default selected department for the pie chart
        if (adminDept.length > 0) setSelectedAdminDept(adminDept[0]);
      },
      (error) => {
        console.error(error.message);
      }
    );
  };

  // Handle the change in department selection for the pie chart
  const handleAdminDeptSelect = (dept) => {
    setSelectedAdminDept(dept);

    if (dept.employees && Array.isArray(dept.employees)) {
      // Fetch the clearance data for the selected department (assuming clearance data is available)
      const clearance = dept.employees.reduce(
        (acc, employee) => {
          if (employee.clearanceGranted) {
            acc.granted++;
          } else {
            acc.notGranted++;
          }
          return acc;
        },
        { granted: 0, notGranted: 0 }
      );

      // Calculate percentages
      const totalEmployees = clearance.granted + clearance.notGranted;
      const grantedPercent = (
        (clearance.granted / totalEmployees) *
        100
      ).toFixed(2);
      const notGrantedPercent = (
        (clearance.notGranted / totalEmployees) *
        100
      ).toFixed(2);

      setClearanceData([
        { label: "Granted", value: grantedPercent },
        { label: "Not Granted", value: notGrantedPercent },
      ]);
    } else {
      // Handle the case where employees data is missing
      console.error("Employees data is missing for the selected department.");
      setClearanceData([]); // Clear any previous data
    }
  };

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      if (user?.is_admin) navigate("/dashboard");
      else if (!user?.is_staff && !user?.is_superuser) navigate("/swtd");
      else {
        setLoading(true);
        const fetchData = async () => {
          await fetchDepartments();
          fetchTerms();
        };
        fetchData();
      }
    }
  }, [user, navigate]);

  // New useEffect to set the default selected level
  useEffect(() => {
    if (levels.length > 0 && !selectedLevel) {
      // Set default selected level as the first item in the levels array
      setSelectedLevel(levels[0]);
      handleLevelSelect(levels[0]); // Populate histogram for the default level
    }
  }, [levels]); // Run whenever levels change

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);

    const filteredDepartments = departments
      .filter((dept) => dept.level === level)
      .map((dept) => ({
        label: dept.name,
        value: dept.value || 0,
      }));

    setHistogramData(filteredDepartments);
  };

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
            Dashboard
          </h3>
        </Col>
      </Row>

      <Row className="w-100">
        <Col lg={4}>
          <PercentCard
            departments={departments}
            level="ELEMENTARY"
            title="Elementary Department"
            term={schoolTerm}
          />
        </Col>

        <Col lg={4}>
          <PercentCard
            departments={departments}
            level="JUNIOR HIGH SCHOOL"
            title="Junior High School Department"
            term={schoolTerm}
          />
        </Col>

        <Col lg={4}>
          <PercentCard
            departments={departments}
            level="SENIOR HIGH SCHOOL"
            title="Senior High School Department"
            term={semesterTerm}
          />
        </Col>
      </Row>

      {/* Histogram Section */}
      <Row className="w-100 mb-3">
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
          {histogramData.length > 0 ? (
            <Histogram
              data={histogramData.map((item) => item.value)}
              labels={histogramData.map((item) => item.label)}
            />
          ) : (
            <p>No data available for the selected level.</p>
          )}
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
          {clearanceData.length > 0 ? (
            <PieChart swtd={clearanceData} term={schoolTerm} />
          ) : (
            <p>No clearance data available for the selected department.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default HRDashboard;
