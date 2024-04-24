import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Container,
  Card,
  Form,
  FloatingLabel,
} from "react-bootstrap";

import SessionUserContext from "../../contexts/SessionUserContext";
import categories from "../../data/categories.json";
import roles from "../../data/roles.json";

import { isEmpty } from "../../common/validation/utils";
import { useSwitch } from "../../hooks/useSwitch";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import logo from "../../images/logo1.png";
import styles from "./style.module.css";
import BtnSecondary from "../../common/buttons/BtnSecondary";

const EditSWTD = ({ id }) => {
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();
  const [isEditing, enableEditing, cancelEditing] = useSwitch();
  const [isClicked, setIsClicked] = useState(false);

  // const [form, setForm] = useState({
  //   author_id: user?.id,
  //   title: "",
  //   venue: "",
  //   category: "",
  //   role: "",
  //   date: "",
  //   time_started: "",
  //   time_finished: "",
  //   points: 0,
  //   benefits: "",
  // });

  const [form, setForm] = useState({
    author_id: user?.id,
    title: "SWTD",
    venue: "CIT",
    category: "Profession/Work-Relevant Seminar",
    role: "Attendee",
    date: "Apr 24 2024",
    time_started: "12:00 AM",
    time_finished: "5:00 PM",
    points: 5,
    benefits: "it was very good i found inner peace",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsClicked(true);

    if (
      isEmpty(form.title) ||
      isEmpty(form.venue) ||
      isEmpty(form.category) ||
      isEmpty(form.role)
    ) {
      return;
    }
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
        <Row className="w-100 mb-3">
          <Col>
            <h3 className={styles.label}>
              <i
                className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
                onClick={handleBackClick}></i>{" "}
              Training Information
            </h3>
          </Col>
          <Col className="text-end">
            {isEditing ? (
              <BtnSecondary onClick={cancelEditing}>
                Cancel Editing
              </BtnSecondary>
            ) : (
              <BtnSecondary onClick={enableEditing}>Edit</BtnSecondary>
            )}
          </Col>
        </Row>
        <Card style={{ width: "80rem" }}>
          <Card.Header className={styles.cardHeader}>SWTD Details</Card.Header>
          <Card.Body className={`${styles.cardBody} p-4`}>
            {/* Title */}
            <Form noValidate>
              <Row>
                <Form.Group as={Row} className="mb-3" controlId="inputTitle">
                  <Form.Label className={styles.formLabel} column sm="1">
                    Title
                  </Form.Label>
                  {isEditing ? (
                    <Col sm="11">
                      <Form.Control
                        type="text"
                        className={styles.formBox}
                        name="title"
                        onChange={handleChange}
                        value={form.title}
                        isInvalid={isClicked && isEmpty(form.title)}
                      />
                      {isClicked && (
                        <Form.Control.Feedback type="invalid">
                          Title of SWTD is required.
                        </Form.Control.Feedback>
                      )}
                    </Col>
                  ) : (
                    <Col className="d-flex align-items-center">
                      {form.title}
                    </Col>
                  )}
                </Form.Group>
              </Row>

              {/* Venue */}
              <Row>
                <Form.Group as={Row} className="mb-3" controlId="inputVenue">
                  <Form.Label className={styles.formLabel} column sm="1">
                    Venue
                  </Form.Label>
                  {isEditing ? (
                    <Col sm="11">
                      <Form.Control
                        type="text"
                        className={styles.formBox}
                        name="venue"
                        onChange={handleChange}
                        value={form.venue}
                        isInvalid={isClicked && isEmpty(form.venue)}
                      />
                      {isClicked && (
                        <Form.Control.Feedback type="invalid">
                          Venue of SWTD is required.
                        </Form.Control.Feedback>
                      )}
                    </Col>
                  ) : (
                    <Col className="d-flex align-items-center">
                      {form.venue}
                    </Col>
                  )}
                </Form.Group>
              </Row>

              {/* Category */}
              <Row className="w-100">
                <Col>
                  <Form.Group
                    as={Row}
                    className="mb-3"
                    controlId="inputCategory">
                    <Form.Label className={styles.formLabel} column sm="2">
                      Category
                    </Form.Label>
                    {isEditing ? (
                      <Col sm="10">
                        <Form.Select
                          className={styles.formBox}
                          name="category"
                          onChange={handleChange}
                          value={form.category}
                          isInvalid={isClicked && isEmpty(form.category)}>
                          <option value="" disabled>
                            Select a category
                          </option>
                          {categories.categories.map((category, index) => (
                            <option key={index} value={category}>
                              {category}
                            </option>
                          ))}
                        </Form.Select>
                        {isClicked && (
                          <Form.Control.Feedback type="invalid">
                            Category of SWTD is required.
                          </Form.Control.Feedback>
                        )}
                      </Col>
                    ) : (
                      <Col className="d-flex align-items-center">
                        {form.category}
                      </Col>
                    )}
                  </Form.Group>
                </Col>

                {/* Role */}
                <Col>
                  <Form.Group as={Row} className="mb-3" controlId="inputRole">
                    <Form.Label
                      className={`${styles.formLabel} text-end`}
                      column
                      sm="2">
                      Role
                    </Form.Label>
                    {isEditing ? (
                      <Col sm="10">
                        <Form.Select
                          className={styles.formBox}
                          name="role"
                          onChange={handleChange}
                          value={form.role}
                          isInvalid={isClicked && isEmpty(form.role)}>
                          <option value="" disabled>
                            Select a role
                          </option>
                          {roles.roles.map((role, index) => (
                            <option key={index} value={role}>
                              {role}
                            </option>
                          ))}
                        </Form.Select>
                        {isClicked && (
                          <Form.Control.Feedback type="invalid">
                            Role is required.
                          </Form.Control.Feedback>
                        )}
                      </Col>
                    ) : (
                      <Col className="d-flex align-items-center">
                        {form.role}
                      </Col>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              {/* Date */}
              <Row className="w-100">
                <Col>
                  <Form.Group as={Row} className="mb-3" controlId="inputDate">
                    <Form.Label className={styles.formLabel} column sm="2">
                      Date
                    </Form.Label>
                    {isEditing ? (
                      <Col sm="10">
                        <Form.Control
                          type="date"
                          className={styles.formBox}
                          name="date"
                          onChange={handleChange}
                          value={form.date}
                          isInvalid={isClicked && isEmpty(form.date)}
                        />
                        {isClicked && (
                          <Form.Control.Feedback type="invalid">
                            Date of SWTD is required.
                          </Form.Control.Feedback>
                        )}
                      </Col>
                    ) : (
                      <Col className="d-flex align-items-center">
                        {form.date}
                      </Col>
                    )}
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

              {/* Time */}
              <Row className="w-100">
                <Col className={styles.time}>
                  <Form.Group
                    as={Row}
                    className="mb-3"
                    controlId="inputTimeStart">
                    <Form.Label className={styles.formLabel} column sm="2">
                      Time
                    </Form.Label>
                    {isEditing ? (
                      <>
                        <Col className="text-start" sm="3">
                          <FloatingLabel
                            controlId="floatingInputStart"
                            label="Time Start">
                            <Form.Control
                              type="time"
                              className={styles.formBox}
                              name="time_started"
                              onChange={handleChange}
                              value={form.time_started}
                              isInvalid={
                                isClicked && isEmpty(form.time_started)
                              }
                            />
                          </FloatingLabel>
                          {isClicked && (
                            <Form.Control.Feedback type="invalid">
                              Time of SWTD is required.
                            </Form.Control.Feedback>
                          )}
                        </Col>
                        <Col
                          className="d-flex align-items-center justify-content-center text-center"
                          sm="1">
                          <span>to</span>
                        </Col>
                        <Col sm="3">
                          <FloatingLabel
                            controlId="floatingInputFinish"
                            label="Time End">
                            <Form.Control
                              type="time"
                              className={styles.formBox}
                              name="time_finished"
                              onChange={handleChange}
                              value={form.time_finished}
                              isInvalid={
                                isClicked && isEmpty(form.time_finished)
                              }
                            />
                          </FloatingLabel>
                          {isClicked && (
                            <Form.Control.Feedback type="invalid">
                              Time of SWTD is required.
                            </Form.Control.Feedback>
                          )}
                        </Col>
                      </>
                    ) : (
                      <Col className="d-flex align-items-center" sm="10">
                        {form.time_started} to {form.time_finished}
                      </Col>
                    )}
                  </Form.Group>
                </Col>
                <Col className="text-end">
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
              </Row>

              {/* Benefits */}
              <Row>
                <Form.Group as={Row} className="mb-3" controlId="inputBenefits">
                  <Form.Label className={styles.formLabel} column sm="1">
                    Benefits
                  </Form.Label>
                  {isEditing ? (
                    <Col sm="11">
                      <Form.Control
                        as="textarea"
                        className={styles.formBox}
                        name="benefits"
                        onChange={handleChange}
                        value={form.benefits}
                        isInvalid={isClicked && isEmpty(form.benefits)}
                      />
                      {isClicked && (
                        <Form.Control.Feedback type="invalid">
                          Benefits is required.
                        </Form.Control.Feedback>
                      )}
                    </Col>
                  ) : (
                    <Col className="d-flex align-items-center">
                      {form.benefits}
                    </Col>
                  )}
                </Form.Group>
              </Row>
              {isEditing && (
                <Row>
                  <Col className="text-end">
                    <BtnPrimary onClick={handleSubmit}>Save Changes</BtnPrimary>
                  </Col>
                </Row>
              )}
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default EditSWTD;
