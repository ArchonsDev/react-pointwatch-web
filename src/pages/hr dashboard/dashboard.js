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
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [histogramData, setHistogramData] = useState([]);
  const [selectedAdminDept, setSelectedAdminDept] = useState(null);
  const [clearanceData, setClearanceData] = useState([]);

  // Pie Chart
  const [adminOfficeMembers, setAdminOfficeMembers] = useState([]);
  const [pieChartData, setPieChartData] = useState(null)

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

        const adminDept = response.departments.filter(
          (dept) => dept.level === "ADMIN & ACADEMIC SUPPORT OFFICES"
        );

        if (adminDept.length > 0) setSelectedAdminDept(adminDept[0]);
      },
      (error) => {
        console.error(error.message);
      }
    );
  };

  const fetchMembers = (dept) => {
    getAllMembers(
      {
        id: dept.id,
        token: token,
      },
      (response) => {
        if (response.data.members?.length > 0) {
          dept.members = dept.members
            ? [...dept.members, ...response.data.members]
            : [...response.data.members];
        } else {
          dept.members = [];
        }

        setLoading(false);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const handleAdminDeptSelect = async (department) => {
    setSelectedAdminDept(department);

    await getAllMembers({ token: token, id: department.id }, (r) => {
      console.log(r.data.members.length);
      if (r.data.members.length === 0) setPieChartData(null);
      else setAdminOfficeMembers(r.data.members);
    });
  };

  useEffect(() => {
    if (adminOfficeMembers.length == 0) return;

    const compute = async () => {
      const clearedCount = adminOfficeMembers.filter((emp) => (
        emp.clearances.some((clearance) => clearance.term.id === schoolTerm.id)
      )).length;

      const percentCleared = Math.round((clearedCount / adminOfficeMembers.length) * 10000) / 100;

      setPieChartData({
        "Cleared %": percentCleared,
        "Not Cleared": 100 - percentCleared,
      });
    };

    compute();
  }, [adminOfficeMembers])

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    const filteredDepartments = departments.filter(
      (dept) => dept.level === level
    );
    console.log(filteredDepartments);
    setHistogramData(filteredDepartments);
  };

  useEffect(() => {
    if (levels.length > 0 && !selectedLevel) {
      setSelectedLevel(levels[0]);
      handleLevelSelect(levels[0]);
    }
  }, [levels]);

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      if (user?.is_admin) navigate("/dashboard");
      else if (!user?.is_staff && !user?.is_superuser) navigate("/swtd");
      else {
        setLoading(true);
        const fetchData = () => {
          fetchDepartments();
          fetchTerms();
        };
        fetchData();
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (departments)
      departments?.forEach((dept) => {
        fetchMembers(dept);
      });
  }, [departments]);

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

      <Row className="w-100 mb-3">
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
        <Col md={8}>
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
              <Col>
                <Histogram departments={histogramData} term={semesterTerm} />
              </Col>
          </Row>
        </Col>

        <Col md={4}>
          <Row className="w-100 mb-3">
            <Col>
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
            </Col>
          </Row>
          <Row className="w-100">
            <Col>
              {pieChartData ? (
                <PieChart label={"Pie Chart"} data={pieChartData} />
              ) : (
                <p>No clearance data available for the selected department.</p>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default HRDashboard;
