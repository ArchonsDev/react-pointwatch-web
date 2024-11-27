import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, InputGroup, Spinner, Form } from "react-bootstrap"; /* prettier-ignore */
import { getTerms, getAllDepartments } from "../../api/admin"; /* prettier-ignore */
import { getAllMembers } from "../../api/department";

import PercentCard from "../../components/PercentCard";
import { Histogram } from "../../components/Histogram";
import { PieChart } from "../../components/Pie";
import SessionUserContext from "../../contexts/SessionUserContext";
import BtnPrimary from "../../common/buttons/BtnPrimary";

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
  const [offices, setOffices] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [histogramData, setHistogramData] = useState([]);
  const [selectedAdminDept, setSelectedAdminDept] = useState("");
  const [departmentsFetched, setDepartmentsFetched] = useState(false);

  // Pie Chart
  const [adminOfficeMembers, setAdminOfficeMembers] = useState([]);
  const [pieChartData, setPieChartData] = useState(null);

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
      },
      (error) => {
        console.error(error.message);
      }
    );
  };

  const fetchMembers = (dept) => {
    return new Promise((resolve, reject) => {
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
          } else dept.members = [];
          resolve(dept);
        },
        (error) => reject(error)
      );
    });
  };

  const handleAdminDeptSelect = async (department) => {
    setSelectedAdminDept(department);
    const dept = departments.find((d) => d.id === parseInt(department, 10));
    if (dept.members.length === 0) setPieChartData(null);
    else setAdminOfficeMembers(dept.members);
  };

  useEffect(() => {
    if (adminOfficeMembers.length === 0) return;
    const compute = async () => {
      const clearedCount = adminOfficeMembers.filter((emp) =>
        emp.clearances.some(
          (clearance) =>
            clearance.term.id === schoolTerm.id && !clearance.is_deleted
        )
      ).length;

      const percentCleared =
        Math.round((clearedCount / adminOfficeMembers.length) * 10000) / 100;

      setPieChartData({
        "Cleared Employees": percentCleared,
        "Non Cleared Employees": 100 - percentCleared,
      });
    };

    compute();
  }, [adminOfficeMembers]);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    const filteredDepartments = departments.filter(
      (dept) => dept.level === level
    );
    setHistogramData(filteredDepartments);
  };

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
    const fetchAllMembers = async () => {
      const departmentsWithMembers = await Promise.all(
        departments.map(fetchMembers)
      );
      setLoading(false);
      setDepartments(departmentsWithMembers);
      const adminDept = departmentsWithMembers.filter(
        (dept) => dept.level === "ADMIN & ACADEMIC SUPPORT OFFICES"
      );
      setOffices(adminDept);
      setSelectedAdminDept(adminDept[0].id);
      handleAdminDeptSelect(adminDept[0].id);
    };

    if (departments?.length && !departmentsFetched) {
      fetchAllMembers();
      setDepartmentsFetched(true);
    }
  }, [departments, departmentsFetched]);

  useEffect(() => {
    if (!loading) {
      setSelectedLevel(levels[0]);
      handleLevelSelect(levels[0]);
    }
  }, [loading]);

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

  console.log();

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center">
      <Row className="w-100 mb-3">
        <Col>
          <h3 className={`${styles.pageTitle} d-flex align-items-center`}>
            Departmental Dashboard
          </h3>
        </Col>
        <Col className="text-end">
          <BtnPrimary onClick={() => navigate("/hr")}>
            Points Overview
          </BtnPrimary>
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
            term={semesterTerm ? semesterTerm : midTerm}
          />
        </Col>
      </Row>

      <Row className="w-100">
        <Col>
          <hr className="w-100" />
        </Col>
      </Row>

      {/* Histogram Section */}
      <Row className={`${styles.deptDropdown} w-100 mb-3`}>
        <Col md={7}>
          <Row className={`w-100 mb-3`}>
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text className={styles.iconBox}>
                  <i
                    className={`${styles.formIcon} fa-solid fa-landmark fa-lg`}></i>
                </InputGroup.Text>
                <Form.Select
                  value={selectedLevel}
                  onChange={(e) => handleLevelSelect(e.target.value)}>
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>

          <Row className="px-0 w-100">
            <Col className={styles.graphBackground}>
              <Histogram
                departments={histogramData}
                term={semesterTerm ? semesterTerm : midTerm}
              />
            </Col>
          </Row>
        </Col>

        <Col md={5}>
          <Row className="w-100 mb-3">
            <Col className="text-start">
              <InputGroup>
                <InputGroup.Text className={styles.iconBox}>
                  <i
                    className={`${styles.formIcon} fa-solid fa-book fa-lg`}></i>
                </InputGroup.Text>
                <Form.Select
                  value={selectedAdminDept}
                  onChange={(e) => handleAdminDeptSelect(e.target.value)}>
                  {offices.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
          <Row className={`${styles.graphBackground} w-100`}>
            <Col>
              {pieChartData ? (
                <PieChart label={"Pie Chart"} data={pieChartData} />
              ) : (
                <span className={`d-flex align-items-center`}>
                  No clearance data available for the selected office.
                </span>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default HRDashboard;
