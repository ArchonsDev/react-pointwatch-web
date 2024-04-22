import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, Card, Form } from "react-bootstrap";

import SessionUserContext from "../../contexts/SessionUserContext";
import BtnPrimary from "../../common/buttons/BtnPrimary";

import logo from "../../images/logo1.png";
import styles from "./style.module.css";

const SWTDForm = () => {
  const { user, setUser } = useContext(SessionUserContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    author_id: user.id,
    title: "",
    venue: "",
    category: "",
    role: "",
    date: "",
    time_started: "",
    time_finished: "",
    points: 0,
    benefits: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleBackClick = () => {
    navigate("/swtd");
  };

  return (
    <div className={styles.background}>
      <header className={styles.header}>
        <Row>
          <Col className="text-end">
            <h3>
              <img src={logo} height="50px" alt="PointWatch logo" /> PointWatch
            </h3>
          </Col>
        </Row>
      </header>

      <Container className="d-flex flex-column justify-content-start align-items-start">
        <Row className="mb-3">
          <h3 className={styles.label}>
            <i
              className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
              onClick={handleBackClick}></i>{" "}
            Add a New Record
          </h3>
        </Row>

        <Card style={{ width: "80rem" }}>
          <Card.Header>SWTD Details</Card.Header>
          <Card.Body className="p-4">
            {/* Title */}
            <Form>
              <Row>
                <Form.Group as={Row} className="mb-3" controlId="inputTitle">
                  <Form.Label className={styles.formLabel} column sm="1">
                    Title
                  </Form.Label>
                  <Col sm="11">
                    <Form.Control
                      type="text"
                      className={styles.formBox}
                      name="title"
                      onChange={handleChange}
                      value={form.title}
                    />
                  </Col>
                </Form.Group>
              </Row>
              {/* Venue */}
              <Row>
                <Form.Group as={Row} className="mb-3" controlId="inputVenue">
                  <Form.Label className={styles.formLabel} column sm="1">
                    Venue
                  </Form.Label>
                  <Col sm="11">
                    <Form.Control
                      type="text"
                      className={styles.formBox}
                      name="venue"
                      onChange={handleChange}
                      value={form.venue}
                    />
                  </Col>
                </Form.Group>
              </Row>
              {/* Role and Category */}
              <Row className="w-100">
                <Col>
                  <Form.Group
                    as={Row}
                    className="mb-3"
                    controlId="inputCategory">
                    <Form.Label className={styles.formLabel} column sm="2">
                      Category
                    </Form.Label>
                    <Col sm="10">
                      <Form.Control
                        className={styles.formBox}
                        name="category"
                        onChange={handleChange}
                        value={form.category}
                      />
                    </Col>
                  </Form.Group>
                </Col>

                <Col>
                  <Form.Group as={Row} className="mb-3" controlId="inputRole">
                    <Form.Label
                      className={`${styles.formLabel} text-end`}
                      column
                      sm="2">
                      Role
                    </Form.Label>
                    <Col sm="10">
                      <Form.Control
                        className={styles.formBox}
                        name="role"
                        onChange={handleChange}
                        value={form.role}
                      />
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
              {/* Date and Time */}
              <Row className="w-100">
                <Col>
                  <Form.Group as={Row} className="mb-3" controlId="inputDate">
                    <Form.Label className={styles.formLabel} column sm="2">
                      Date
                    </Form.Label>
                    <Col sm="10">
                      <Form.Control
                        type="date"
                        className={styles.formBox}
                        name="date"
                        onChange={handleChange}
                        value={form.date}
                      />
                    </Col>
                  </Form.Group>
                </Col>

                <Col className="text-end">
                  <Form.Group as={Row} className="mb-3" controlId="inputTime">
                    <Form.Label className={styles.formLabel} column sm="2">
                      Time
                    </Form.Label>
                    <Col sm="5">
                      <Form.Control
                        type="time"
                        className={styles.formBox}
                        name="time_started"
                        onChange={handleChange}
                        value={form.time_started}
                      />
                    </Col>
                    <Col sm="5">
                      <Form.Control
                        type="time"
                        className={styles.formBox}
                        name="time_finished"
                        onChange={handleChange}
                        value={form.time_finished}
                      />
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="w-100">
                <Col>
                  <Form.Group as={Row} className="mb-3" controlId="inputPoints">
                    <Form.Label className={styles.formLabel} column sm="2">
                      Points
                    </Form.Label>
                    <Col className="text-start" sm="2">
                      <Form.Control
                        className={styles.formBox}
                        name="points"
                        onChange={handleChange}
                        value={form.points}
                        readOnly
                      />
                    </Col>
                  </Form.Group>
                </Col>
                <Col className="text-end">
                  <Form.Group as={Row} className="mb-3" controlId="inputProof">
                    <Form.Label className={styles.formLabel} column sm="2">
                      Proof
                    </Form.Label>
                    <Col className="text-start" sm="10">
                      <Form.Control
                        type="file"
                        className={styles.formBox}
                        name="proof"
                      />
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col className="text-end">
                  <BtnPrimary>Submit</BtnPrimary>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default SWTDForm;
