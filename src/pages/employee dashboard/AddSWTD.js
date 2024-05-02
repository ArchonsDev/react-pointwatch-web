import React, { useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, Card, Form, FloatingLabel } from "react-bootstrap"; /* prettier-ignore */

import SessionUserContext from "../../contexts/SessionUserContext";
import categories from "../../data/categories.json";
import roles from "../../data/roles.json";
import { addSWTD } from "../../api/swtd";
import { useTrigger } from "../../hooks/useTrigger";
import { isEmpty, isValidDate } from "../../common/validation/utils";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import logo from "../../images/logo1.png";
import styles from "./style.module.css";
import { clear } from "@testing-library/user-event/dist/clear";

const AddSWTD = () => {
  const { user } = useContext(SessionUserContext);
  const accessToken = Cookies.get("userToken");
  const navigate = useNavigate();

  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [showError, triggerShowError] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleBackClick = () => {
    navigate("/swtd");
  };

  const [form, setForm] = useState({
    author_id: user?.id,
    title: "",
    venue: "",
    category: "",
    role: "",
    date: "",
    time_started: "",
    time_finished: "",
    points: 50,
    benefits: "",
  });

  const clearForm = () => {
    setForm({
      ...form,
      title: "",
      venue: "",
      category: "",
      role: "",
      date: "",
      time_started: "",
      time_finished: "",
      benefits: "",
    });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const isTimeInvalid = () => {
    const timeStart = form.time_started;
    const timeFinish = form.time_finished;

    if (timeStart > timeFinish) return true;
  };

  const invalidFields = () => {
    const requiredFields = [
      "title",
      "venue",
      "category",
      "role",
      "date",
      "time_started",
      "time_finished",
    ];
    return (
      requiredFields.some((field) => isEmpty(form[field])) ||
      !isValidDate(form.date) ||
      isTimeInvalid()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      isEmpty(form.title) ||
      isEmpty(form.venue) ||
      isEmpty(form.category) ||
      isEmpty(form.role) ||
      isEmpty(form.date) ||
      !isValidDate(form.date) ||
      isTimeInvalid() ||
      isEmpty(form.time_started) ||
      isEmpty(form.time_finished)
    ) {
      setErrorMessage("An error occurred. Please check the details again.");
      triggerShowError(4500);
      return;
    }

    if (!isEmpty(form.date)) {
      const [year, month, day] = form.date.split("-");
      form.date = `${month}-${day}-${year}`;
    }

    await addSWTD(
      { ...form, token: accessToken },
      (response) => {
        setTimeout(() => {
          triggerShowSuccess(4500);
          clearForm();
        });
      },
      (error) => {
        if (error.response && error.response.data) {
          console.log(error.response.data.error);
          setErrorMessage(<>{error.response.data.error}</>);
          triggerShowError(4500);
          setForm({
            ...form,
            date: "",
          });
        } else {
          setErrorMessage(<>An error occurred.</>);
          triggerShowError(4500);
        }
      }
    );
  };

  useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      author_id: user?.id,
    }));
  }, [user]);

  return (
    <div className={styles.background}>
      <Container
        className={`${styles.container} d-flex flex-column justify-content-center align-items-start`}>
        <Row className="mb-3">
          <h3 className={styles.label}>
            <i
              className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
              onClick={handleBackClick}></i>{" "}
            Add a New Record
          </h3>
        </Row>

        <Card className="mb-3" style={{ width: "80rem" }}>
          <Card.Header className={styles.cardHeader}>SWTD Details</Card.Header>
          <Card.Body className={`${styles.cardBody} p-4`}>
            {showError && (
              <div className="alert alert-danger mb-3" role="alert">
                {errorMessage}
              </div>
            )}
            {showSuccess && (
              <div className="alert alert-success mb-3" role="alert">
                Entry submitted!
              </div>
            )}
            <Form noValidate>
              {/* Title */}
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
                    <Col sm="10">
                      <Form.Select
                        className={styles.formBox}
                        name="category"
                        onChange={handleChange}
                        value={form.category}>
                        <option value="" disabled>
                          Select a category
                        </option>
                        {categories.categories.map((category, index) => (
                          <option key={index} value={category}>
                            {category}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
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
                    <Col sm="10">
                      <Form.Select
                        className={styles.formBox}
                        name="role"
                        onChange={handleChange}
                        value={form.role}>
                        <option value="" disabled>
                          Select a role
                        </option>
                        {roles.roles.map((role, index) => (
                          <option key={index} value={role}>
                            {role}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
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
                    <Col sm="10">
                      <Form.Control
                        type="date"
                        max={new Date().toISOString().slice(0, 10)}
                        className={styles.formBox}
                        name="date"
                        onChange={handleChange}
                        value={form.date}
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
                    <Col className="text-start" sm="4">
                      <FloatingLabel
                        controlId="floatingInputStart"
                        label="Time Start">
                        <Form.Control
                          type="time"
                          className={styles.formBox}
                          name="time_started"
                          onChange={handleChange}
                          value={form.time_started}
                          isInvalid={isTimeInvalid()}
                        />
                        <Form.Control.Feedback type="invalid">
                          Time must be valid.
                        </Form.Control.Feedback>
                      </FloatingLabel>
                    </Col>
                    <Col
                      className="d-flex align-items-center justify-content-center text-center"
                      sm="1">
                      <span>to</span>
                    </Col>
                    <Col sm="4">
                      <FloatingLabel
                        controlId="floatingInputFinish"
                        label="Time End">
                        <Form.Control
                          type="time"
                          className={styles.formBox}
                          name="time_finished"
                          onChange={handleChange}
                          value={form.time_finished}
                        />
                      </FloatingLabel>
                    </Col>
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
                  <Col sm="11">
                    <Form.Control
                      as="textarea"
                      className={styles.formBox}
                      name="benefits"
                      onChange={handleChange}
                      value={form.benefits}
                    />
                  </Col>
                </Form.Group>
              </Row>
              <Row>
                <Col className="text-end">
                  <BtnPrimary onClick={handleSubmit} disabled={invalidFields()}>
                    Submit
                  </BtnPrimary>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AddSWTD;
