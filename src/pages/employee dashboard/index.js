import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup } from "react-bootstrap"; /* prettier-ignore */
import { getAllSWTDs } from "../../api/swtd";
import SessionUserContext from "../../contexts/SessionUserContext";
import BtnPrimary from "../../common/buttons/BtnPrimary";
import styles from "./style.module.css";

const SWTDDashboard = () => {
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();
  const [userSWTDs, setUserSWTDs] = useState([]);
  const token = Cookies.get("userToken");
  const id = Cookies.get("userID");

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

  useEffect(() => {
    fetchAllSWTDs();
  }, []);

  const handleAddRecordClick = () => {
    navigate("/swtd/form");
  };

  const handleEditRecordClick = (id) => {
    navigate(`/swtd/${id}`);
  };

  return (
    <div className={styles.background}>
      <Container className="d-flex flex-column justify-content-start align-items-start">
        <Row className="mb-2">
          <h3 className={styles.label}>SWTD Points Overview</h3>
        </Row>

        <Row className={`${styles.employeeDetails} w-100 mb-3`}>
          <Col xs="auto">
            <i className="fa-regular fa-calendar me-2"></i> Term:
          </Col>
          <Col xs="auto">
            <i className="fa-solid fa-building me-2"></i>Department:{" "}
            {user?.department}
          </Col>
          <Col xs="auto">
            <i className="fa-solid fa-circle-plus me-2"></i>Total Points:{" "}
            {user?.swtd_points.valid_points}
          </Col>
          <Col xs="auto">
            <i className="fa-solid fa-plus-minus me-2"></i>Excess/Lacking
            Points:
          </Col>
        </Row>

        <Row className="w-100">
          <Col className="text-start" md={6}>
            <InputGroup className={`${styles.searchBar} mb-3`}>
              <InputGroup.Text>
                <i className="fa-solid fa-magnifying-glass"></i>
              </InputGroup.Text>
              <Form.Control type="search" placeholder="Search" />
            </InputGroup>
          </Col>

          <Col className="text-end" md={3}>
            <Form.Group as={Row} controlId="inputFilter">
              <Form.Label className={styles.filterText} column sm="3">
                Filter
              </Form.Label>
              <Col sm="9">
                <Form.Select name="filter">
                  <option value="">Points</option>
                  <option value="">Status</option>
                  <option value="">Yeah</option>
                </Form.Select>
              </Col>
            </Form.Group>
          </Col>
          <Col className="text-end" md={3}>
            <BtnPrimary onClick={handleAddRecordClick}>
              Add a New Record
            </BtnPrimary>
          </Col>
        </Row>

        <Row className="w-100">
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
            {userSWTDs &&
              userSWTDs.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  className={styles.tableBody}
                  onClick={() => handleEditRecordClick(item.id)}>
                  <Row>
                    <Col xs={1}>{item.id}</Col>
                    <Col xs={7}>{item.title}</Col>
                    <Col xs={2}>{item.points}</Col>
                    <Col xs={2}>{item.validation.status}</Col>
                  </Row>
                </ListGroup.Item>
              ))}
          </ListGroup>
        </Row>
      </Container>
    </div>
  );
};

export default SWTDDashboard;
