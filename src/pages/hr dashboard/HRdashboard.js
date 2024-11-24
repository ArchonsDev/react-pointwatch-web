import React, { useContext, useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, DropdownButton, Dropdown, Spinner } from "react-bootstrap"; /* prettier-ignore */
import { getAllUsers, getTerms, getAllDepartments } from "../../api/admin"; /* prettier-ignore */
import styles from "./style.module.css";
import { StackedBarGraph } from "../../components/StackedBar";
import { Histogram } from "../../components/Histogram";
import { PieChart } from "../../components/Pie";

const HRDashboard = () => {
  const token = Cookies.get("userToken");
  const navigate = useNavigate();

  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [collegeLevels, setCollegeLevels] = useState([]);
  const [elementaryClearedPercentage, setElementaryClearedPercentage] =
    useState(0);
  const [juniorHighClearedPercentage, setJuniorHighClearedPercentage] =
    useState(0);
  const [seniorHighClearedPercentage, setSeniorHighClearedPercentage] =
    useState(0);

  const [adminSupportData] = useState([
    { label: "Admin", value: 30 }, // Example value for Admin department
    { label: "Support", value: 70 }, // Example value for Support department
  ]);

  const placeholderData = [
    { department: "HR", cleared: 5, notCleared: 5 },
    { department: "Finance", cleared: 2, notCleared: 8 },
    { department: "IT", cleared: 10, notCleared: 0 },
    { department: "Marketing", cleared: 4, notCleared: 6 },
  ];

  const fetchTerms = () => {
    getTerms(
      { token },
      (response) => {
        const filteredTerms = response.terms;
        setTerms(filteredTerms);
        const firstOngoingTerm = filteredTerms.find((term) => term.is_ongoing);
        setSelectedTerm(firstOngoingTerm || filteredTerms[0]);
        setLoading(false);
      },
      (error) => {
        console.error(error.message);
        setLoading(false);
      }
    );
  };

  const fetchUsers = () => {
    getAllUsers(
      { token },
      (response) => {
        const users = response.users || [];
        setUsers(users);

        // Filter elementary employees for the ongoing term and calculate the percentage of cleared ones
        if (selectedTerm) {
          // Filter for elementary employees
          const elementaryEmployees = users.filter(
            (user) =>
              user.collegeLevel === "Elementary" &&
              user.termId === selectedTerm.id
          );
          const totalElementary = elementaryEmployees.length;
          const clearedElementary = elementaryEmployees.filter(
            (user) => user.cleared
          ).length;
          const clearedPercentage = totalElementary
            ? (clearedElementary / totalElementary) * 100
            : 0;
          setElementaryClearedPercentage(clearedPercentage);

          // Filter for junior high employees
          const juniorHighEmployees = users.filter(
            (user) =>
              user.collegeLevel === "Junior High" &&
              user.termId === selectedTerm.id
          );
          const totalJuniorHigh = juniorHighEmployees.length;
          const clearedJuniorHigh = juniorHighEmployees.filter(
            (user) => user.cleared
          ).length;
          const juniorHighPercentage = totalJuniorHigh
            ? (clearedJuniorHigh / totalJuniorHigh) * 100
            : 0;
          setJuniorHighClearedPercentage(juniorHighPercentage);

          const seniorHighEmployees = users.filter(
            (user) =>
              user.collegeLevel === "Senior High" &&
              user.termId === selectedTerm.id
          );
          const totalSeniorHigh = seniorHighEmployees.length;
          const clearedSeniorHigh = seniorHighEmployees.filter(
            (user) => user.cleared
          ).length;
          const seniorHighPercentage = totalSeniorHigh
            ? (clearedSeniorHigh / totalSeniorHigh) * 100
            : 0;
          setSeniorHighClearedPercentage(seniorHighPercentage);
        }
      },
      (error) => {
        console.error(error.message);
      }
    );
  };

  const fetchDepartments = () => {
    getAllDepartments(
      { token },
      (response) => {
        setDepartments(response.departments || []);
      },
      (error) => {
        console.error(error.message);
      }
    );
  };

  useEffect(() => {
    fetchDepartments();
    fetchTerms();
    fetchUsers();
  }, [selectedTerm]); // Re-fetch users when the selectedTerm changes

  if (loading)
    return (
      <Row
        className={`${styles.loading} d-flex flex-column justify-content-center align-items-center w-100`}
        style={{ height: "100vh" }}>
        <Spinner animation="border" />
        Loading data...
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
        <Col
          className={`d-flex align-items-center ${styles.employeeDetails}`}
          xs="auto">
          <i className="fa-regular fa-calendar fa-lg me-2"></i> Term:{" "}
          {terms.length === 0 ? (
            <>No terms were added yet.</>
          ) : (
            <DropdownButton
              className="ms-2"
              variant={
                selectedTerm?.is_ongoing === true ? "success" : "secondary"
              }
              size="sm"
              title={selectedTerm?.name}>
              {terms.map((term) => (
                <Dropdown.Item
                  key={term.id}
                  onClick={() => setSelectedTerm(term)}>
                  {term.name}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          )}
        </Col>
      </Row>

      <Row>
        {/* Elementary Cleared Card */}
        <Col>
          <Card style={{ width: "18rem" }}>
            <Card.Body>
              <Card.Title>Elementary Employees Cleared</Card.Title>
              <Card.Text>
                {elementaryClearedPercentage ? (
                  <>
                    {elementaryClearedPercentage.toFixed(2)}% of elementary
                    employees were marked as cleared for the current term.
                  </>
                ) : (
                  <>No elementary employees found for this term.</>
                )}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Junior High Employees Cleared Card */}
        <Col>
          <Card style={{ width: "18rem" }}>
            <Card.Body>
              <Card.Title>Junior High Employees Cleared</Card.Title>
              <Card.Text>
                {juniorHighClearedPercentage ? (
                  <>
                    {juniorHighClearedPercentage.toFixed(2)}% of junior high
                    employees were marked as cleared for the current term.
                  </>
                ) : (
                  <>No junior high employees found for this term.</>
                )}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Senior High Employees Cleared Card */}
        <Col>
          <Card style={{ width: "18rem" }}>
            <Card.Body>
              <Card.Title>Senior High Employees Cleared</Card.Title>
              <Card.Text>
                {seniorHighClearedPercentage ? (
                  <>
                    {seniorHighClearedPercentage.toFixed(2)}% of senior high
                    employees were marked as cleared for the current term.
                  </>
                ) : (
                  <>No senior high employees found for this term.</>
                )}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/*
      <Row className="w-100">
        <Col>
          <div style={{ width: "50%", margin: "10px" }}>
            <StackedBarGraph data={placeholderData} />
          </div>
        </Col>
      </Row>
      */}

      <Row className="w-100">
        <Col>
          <div style={{ width: "50%", margin: "10px" }}>
            <Histogram
              data={[5, 10, 8, 3, 7]}
              labels={["0-10", "11-20", "21-30", "31-40", "41-50"]}
            />
          </div>
        </Col>

        <Col md={6}>
          <div style={{ width: "30%", margin: "10px" }}>
            <PieChart swtd={adminSupportData} term={selectedTerm} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default HRDashboard;
