import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup, DropdownButton, Dropdown } from "react-bootstrap"; /* prettier-ignore */

import { getTerms } from "../../api/admin";
import { getAllSWTDs } from "../../api/swtd";
import SessionUserContext from "../../contexts/SessionUserContext";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import styles from "./style.module.css";

const SWTDDashboard = () => {
  const id = Cookies.get("userID");
  const token = Cookies.get("userToken");
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();

  const [userSWTDs, setUserSWTDs] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);

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

  const handleAddRecordClick = () => {
    navigate("/swtd/form");
  };

  const handleEditRecordClick = (id) => {
    navigate(`/swtd/${id}`);
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

  const filteredSWTDs = userSWTDs?.filter(
    (swtd) => swtd?.term.id === selectedTerm?.id
  );

  useEffect(() => {
    fetchTerms();
    fetchAllSWTDs();
  }, []);

  return (
    <Container className="d-flex flex-column justify-content-start align-items-start">
      <Row className="mb-2">
        <h3 className={styles.label}>SWTD Points Overview</h3>
      </Row>

      <Row className={`${styles.employeeDetails} w-100 mb-3`}>
        <Col className="d-flex align-items-center" xs="auto">
          <i className="fa-regular fa-calendar me-2"></i> Term:{" "}
          <DropdownButton
            className={`ms-2`}
            variant="secondary"
            size="sm"
            title={selectedTerm ? selectedTerm.name : "Select term"}
          >
            {terms.length === 0 ? (
              <Dropdown.Item disabled>No terms added.</Dropdown.Item>
            ) : (
              <>
                {terms &&
                  terms.map((term) => (
                    <Dropdown.Item
                      key={term.id}
                      onClick={() => setSelectedTerm(term)}
                    >
                      {term.name}
                    </Dropdown.Item>
                  ))}
              </>
            )}
          </DropdownButton>
        </Col>
        <Col xs="auto">
          <i className="fa-solid fa-building me-2"></i>Department:{" "}
          {user?.department}
        </Col>
        <Col xs="auto">
          <i className="fa-solid fa-circle-plus me-2"></i>Total Points:{" "}
          {user?.swtd_points?.valid_points}
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

        <Col className="text-end">
          <BtnPrimary onClick={handleAddRecordClick}>
            Add a New Record
          </BtnPrimary>
        </Col>
      </Row>

      <Row className="w-100">
        {selectedTerm === null ? (
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
              {userSWTDs.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  className={styles.tableBody}
                  onClick={() => handleEditRecordClick(item.id)}
                >
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
        ) : filteredSWTDs.length === 0 ? (
          <span
            className={`${styles.msg} d-flex justify-content-center align-items-center mt-5 w-100`}
          >
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
                  onClick={() => handleEditRecordClick(item.id)}
                >
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

export default SWTDDashboard;
