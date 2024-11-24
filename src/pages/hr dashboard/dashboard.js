import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, DropdownButton, Dropdown, Spinner} from "react-bootstrap"; /* prettier-ignore */

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
  const [adminSupportData] = useState([
    { label: "Admin", value: 30 },
    { label: "Support", value: 70 },
  ]);

  // Takes the first on going term for each type
  // Have some conditional whatever if it's semester or midyear for
  // the different academic departments.
  const fetchTerms = () => {
    getTerms(
      {
        token: token,
      },
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
        // I don't know if this matters or not lol
        const uniqueLevels = [
          ...new Set(response.departments.map((dept) => dept.level)),
        ];
        setLevels(uniqueLevels);
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
      },
      (error) => {
        console.log(error);
      }
    );
  };

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      if (user?.is_admin) navigate("/dashboard");
      else if (!user?.is_staff && !user?.is_superuser) navigate("/swtd");
      else {
        setLoading(true);
        const fetchData = async () => {
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

      <Row className="w-100">
        {/* Elementary Cleared Card */}
        {/* UNSURE!!!!! I THINK SCHOOL/ACAD YEAR MIGHT OVERLAP W MIDYEAR */}
        <Col lg={4}>
          <PercentCard
            departments={departments}
            level="ELEMENTARY"
            title="Elementary Department"
            term={schoolTerm}
          />
        </Col>

        {/* Junior High Employees Cleared Card */}
        {/* UNSURE!!!!! I THINK SCHOOL/ACAD YEAR MIGHT OVERLAP W MIDYEAR */}
        <Col lg={4}>
          <PercentCard
            departments={departments}
            level="JUNIOR HIGH SCHOOL"
            title="Junior High School Department"
            term={schoolTerm}
          />
        </Col>

        {/* Senior High Employees Cleared Card */}
        <Col lg={4}>
          <PercentCard
            departments={departments}
            level="SENIOR HIGH SCHOOL"
            title="Senior High School Department"
            term={semesterTerm}
          />
        </Col>
      </Row>

      <Row className="w-100">
        <Col md={8}>
          <Histogram
            data={[5, 10, 8, 3, 7]}
            labels={["0-10", "11-20", "21-30", "31-40", "41-50"]}
          />
        </Col>

        <Col md={4}>
          <PieChart swtd={adminSupportData} term={schoolTerm} />
        </Col>
      </Row>
    </Container>
  );
};

export default HRDashboard;
