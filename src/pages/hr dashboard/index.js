import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Nav, Card, Spinner } from "react-bootstrap";
import Cookies from "js-cookie";

import { getTerms, getAllDepartments, getAllUsers } from "../../api/admin"; /* prettier-ignore */

import Academic from "./academic";
import Nonacademic from "./nonacademic";

import SessionUserContext from "../../contexts/SessionUserContext";
import styles from "./style.module.css";

const DepartmentalDashboard = () => {
  const { user } = useContext(SessionUserContext);
  const token = Cookies.get("userToken");
  const navigate = useNavigate();

  const [academicDepartments, setAcademicDepartments] = useState([]);
  const [nonAcademicDepartments, setNonAcademicDepartments] = useState([]);
  const [terms, setTerms] = useState([]);
  const [nonAcademicTerms, setNonAcademicTerms] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("acad");

  const handleSelectTab = (selectedTab) => {
    setActiveTab(selectedTab);
  };

  const fetchDepartments = () => {
    getAllDepartments(
      { token },
      (response) => {
        const departments = response.departments;
        const nonAcad = departments.filter(
          (department) =>
            department.level === "ADMIN & ACADEMIC SUPPORT OFFICES"
        );
        const acad = departments.filter(
          (department) =>
            department.level !== "ADMIN & ACADEMIC SUPPORT OFFICES"
        );
        setAcademicDepartments(acad);
        setNonAcademicDepartments(nonAcad);
      },
      (error) => {
        console.error(error.message);
      }
    );
  };

  const fetchTerms = () => {
    getTerms(
      {
        token: token,
      },
      (response) => {
        const nonAcad = response.terms.filter(
          (term) => term.type === "ACADEMIC YEAR"
        );
        setTerms(response.terms);
        setNonAcademicTerms(nonAcad);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const fetchEmployees = () => {
    getAllUsers(
      {
        token: token,
      },
      (response) => {
        const excludeSuperuser = response.users.filter(
          (user) => !user.is_superuser
        );
        setEmployees(excludeSuperuser);
        setLoading(false);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "acad":
        return (
          <Academic
            departments={academicDepartments}
            terms={terms}
            faculty={employees}
          />
        );
      case "nonacad":
        return (
          <Nonacademic
            departments={nonAcademicDepartments}
            terms={nonAcademicTerms}
            faculty={employees}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      if (user?.access_level === 1) navigate("/dashboard");
      else if (user?.access_level < 1) navigate("/swtd");
      fetchDepartments();
      fetchTerms();
      fetchEmployees();
    }
  }, [user, navigate]);

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
      <Row className="w-100 mb-2">
        <h3 className={styles.pageTitle}>Departmental Dashboard</h3>
      </Row>

      <Row className="w-100">
        <Nav variant="tabs" defaultActiveKey="acad" onSelect={handleSelectTab}>
          <Nav.Item>
            <Nav.Link
              eventKey="acad"
              className={`${styles.navHeader} ${
                activeTab === "acad" ? styles.activeTab : styles.inactiveTab
              } me-2`}>
              Academic
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="nonacad"
              className={`${styles.navHeader} ${
                activeTab === "nonacad" ? styles.activeTab : styles.inactiveTab
              }`}>
              Non-Academic
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Row>
      <Row className="w-100">
        <Card className={`${styles.card} p-4`}>
          <Card.Body>{renderActiveView()}</Card.Body>
        </Card>
      </Row>
    </Container>
  );
};

export default DepartmentalDashboard;
