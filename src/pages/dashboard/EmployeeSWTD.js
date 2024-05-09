import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup, DropdownButton, Dropdown } from "react-bootstrap"; /* prettier-ignore */

import { getTerms } from "../../api/admin";
import { getAllSWTDs } from "../../api/swtd";
import { getUser } from "../../api/user";
import SessionUserContext from "../../contexts/SessionUserContext";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import styles from "./style.module.css";

const EmployeeSWTD = () => {
  const { user } = useContext(SessionUserContext);
  const { id } = useParams();
  const token = Cookies.get("userToken");
  const navigate = useNavigate();

  const [userSWTDs, setUserSWTDs] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);

  const fetchUser = async () => {
    await getUser(
      {
        id: id,
        token: token,
      },
      (response) => {
        setEmployee(response.data);
      },
      (error) => {
        console.log(error.response);
      }
    );
  };

  const fetchAllSWTDs = async () => {
    await getAllSWTDs(
      {
        author_id: id,
        token: token,
      },
      (response) => {
        setUserSWTDs(response.swtds);
      },
      (error) => {
        if (error.response && error.response.data) {
          console.log(error.response.data.error);
        }
      }
    );
  };

  const fetchTerms = () => {
    getTerms(
      {
        token: token,
      },
      (response) => {
        setTerms(response.terms);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const handleBackClick = () => {
    navigate("/dashboard");
  };

  const handleViewSWTD = (swtd_id) => {
    navigate(`/dashboard/${id}/${swtd_id}`);
  };

  const pageTitle = employee
    ? `${employee.firstname} ${employee.lastname}'s SWTDs`
    : "SWTDs";

  const filteredSWTDs = userSWTDs?.filter(
    (swtd) => swtd?.term.id === selectedTerm?.id
  );
  useEffect(() => {
    if (!user?.is_admin && !user?.is_staff && !user?.is_superuser) {
      navigate("/swtd");
    }

    fetchUser();
    fetchTerms();
    fetchAllSWTDs();
  }, []);
  return (
    <Container className="d-flex flex-column justify-content-start align-items-start">
      <Row className="mb-2">
        <h3 className={styles.label}>
          <i
            className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
            onClick={handleBackClick}></i>{" "}
          {pageTitle}
        </h3>
      </Row>

      <Row className={`${styles.employeeDetails} w-100 mb-3`}>
        <Col className="d-flex align-items-center" xs="auto">
          <i className="fa-regular fa-calendar me-2"></i> Term:{" "}
          <DropdownButton
            className="ms-2"
            size="sm"
            variant="success"
            title={selectedTerm ? selectedTerm.name : "Select term"}>
            {terms &&
              terms.map((term) => (
                <Dropdown.Item
                  key={term.id}
                  onClick={() => setSelectedTerm(term)}>
                  {term.name}
                </Dropdown.Item>
              ))}
          </DropdownButton>
        </Col>
        <Col xs="auto">
          <i className="fa-solid fa-building me-2"></i>Department:{" "}
          {employee?.department}
        </Col>
        <Col xs="auto">
          <i className="fa-solid fa-circle-plus me-2"></i>Total Points:{" "}
          {employee?.swtd_points.valid_points}
        </Col>
        <Col xs="auto">
          <i className="fa-solid fa-plus-minus me-2"></i>Excess/Lacking Points:
        </Col>
      </Row>

      <Row className="w-100">
        <Col className="text-start" md={8}>
          <InputGroup className={`${styles.searchBar} mb-3`}>
            <InputGroup.Text>
              <i className="fa-solid fa-magnifying-glass"></i>
            </InputGroup.Text>
            <Form.Control type="search" placeholder="Search" />
          </InputGroup>
        </Col>

        {user?.is_admin && (
          <Col className="text-end">
            <BtnSecondary>Clear Employee</BtnSecondary>
          </Col>
        )}

        <Col className="text-end">
          <BtnPrimary onClick={() => window.print()}>Export Report</BtnPrimary>
        </Col>
      </Row>

      <Row className="w-100">
        {selectedTerm === null ? (
          <span
            className={`${styles.msg} d-flex justify-content-center align-items-center mt-5 w-100`}>
            Please select a term.
          </span>
        ) : filteredSWTDs.length === 0 ? (
          <span
            className={`${styles.msg} d-flex justify-content-center align-items-center mt-5 w-100`}>
            No records found for the selected term.
          </span>
        ) : (
          <>
            <ListGroup className="w-100" variant="flush">
              <ListGroup.Item className={styles.tableHeader}>
                <Row>
                  <Col xs={1}>No.</Col>
                  <Col xs={7}>Title of SWTD</Col>
                  <Col xs={2}>Points</Col>
                  <Col xs={2}>Status</Col>
                </Row>
              </ListGroup.Item>
            </ListGroup>
            <ListGroup>
              {filteredSWTDs.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  className={styles.tableBody}
                  onClick={() => handleViewSWTD(item.id)}>
                  <Row>
                    <Col xs={1}>{item.id}</Col>
                    <Col xs={7}>{item.title}</Col>
                    <Col xs={2}>{item.points}</Col>
                    <Col xs={2}>{item.validation.status}</Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
      </Row>
    </Container>
  );
};

export default EmployeeSWTD;