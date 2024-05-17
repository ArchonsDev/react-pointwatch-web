import React, { useState, useContext, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, Card, Form, Modal } from "react-bootstrap"; /* prettier-ignore */

import SessionUserContext from "../../contexts/SessionUserContext";
import categories from "../../data/categories.json";
import roles from "../../data/roles.json";
import { getTerms } from "../../api/admin";
import { addSWTD } from "../../api/swtd";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { formatDate, formatTermDate } from "../../common/format/date";
import { isEmpty, isValidSWTDDate } from "../../common/validation/utils";
import { calculatePoints } from "../../common/validation/points";

import SWTDInfo from "./SWTDInfo";
import BtnPrimary from "../../common/buttons/BtnPrimary";
import styles from "./style.module.css";

const AddSWTD = () => {
  const { user } = useContext(SessionUserContext);
  const id = Cookies.get("userID");
  const accessToken = Cookies.get("userToken");
  const navigate = useNavigate();
  const inputFile = useRef(null);

  const [loading, setLoading] = useState(false);
  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [showError, triggerShowError] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showModal, openModal, closeModal] = useSwitch();

  const [isProofInvalid, setIsProofInvalid] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState({
    start: "",
    end: "",
    ongoing: false,
  });
  const [terms, setTerms] = useState([]);
  const [form, setForm] = useState({
    author_id: id,
    title: "",
    venue: "",
    category: "",
    term_id: 0,
    role: "",
    date: "",
    time_started: "",
    time_finished: "",
    points: 0,
    proof: "",
    benefits: "",
  });

  const clearForm = () => {
    if (inputFile.current) {
      inputFile.current.value = "";
      inputFile.current.type = "text";
      inputFile.current.type = "file";
    }

    setForm({
      ...form,
      title: "",
      venue: "",
      category: "",
      term_id: 0,
      role: "",
      date: "",
      time_started: "",
      time_finished: "",
      proof: "",
      benefits: "",
    });
  };

  const handleChange = (e) => {
    if (e.target.name === "category" && e.target.value.startsWith("Degree")) {
      setForm({
        ...form,
        time_started: "00:00",
        time_finished: "00:00",
        points: 0,
        [e.target.name]: e.target.value,
      });
    } else if (e.target.name === "term_id") {
      const selectedTermId = parseInt(e.target.value);
      const term = terms.find((term) => term.id === selectedTermId);

      const formattedStartDate = formatDate(term.start_date);
      const formattedEndDate = formatDate(term.end_date);

      setSelectedTerm({
        start: formattedStartDate,
        end: formattedEndDate,
        ongoing: term.is_ongoing,
      });

      setForm({
        ...form,
        date: "",
        [e.target.name]: e.target.value,
      });
    } else {
      setForm({
        ...form,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleProof = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (file && allowedTypes.includes(file.type)) {
      setForm({
        ...form,
        proof: file,
      });
      setIsProofInvalid(false);
    } else {
      inputFile.current.value = null;
      setIsProofInvalid(true);
    }
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
      "benefits",
    ];
    return (
      requiredFields.some((field) => isEmpty(form[field])) ||
      isTimeInvalid() ||
      !isValidSWTDDate(form.date, selectedTerm) ||
      form.term_id === 0 ||
      !form.proof ||
      form.points <= 0
    );
  };

  const getPoints = (name, start, finish) => {
    const total = calculatePoints(name, start, finish);
    setForm({
      ...form,
      points: total,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
          setErrorMessage(<>{error.message}</>);
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

  const fetchTerms = () => {
    getTerms(
      {
        token: accessToken,
      },
      (response) => {
        setTerms(response.terms);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  useEffect(() => {
    const isFormValid =
      !isEmpty(form.category) &&
      !form.category.startsWith("Degree") &&
      !isEmpty(form.time_started) &&
      !isEmpty(form.time_finished);
    if (isFormValid)
      getPoints(form.category, form.time_started, form.time_finished);
    else form.points = 0;
  }, [form.category, form.time_started, form.time_finished]);

  useEffect(() => {
    if (user?.department === null) navigate("/swtd");

    fetchTerms();
    setForm((prevForm) => ({
      ...prevForm,
      author_id: user?.id,
    }));
  }, [user]);

  return (
    <Container
      className={`${styles.container} d-flex flex-column justify-content-center align-items-start`}>
      {/* View Terms Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className={styles.formLabel}>
            Required Points & Compliance Schedule
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SWTDInfo />
        </Modal.Body>
      </Modal>

      <Row className="mb-2">
        <h3 className={styles.label}>
          <i
            className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
            onClick={() => navigate("/swtd")}></i>{" "}
          Add a New Record
        </h3>
      </Row>

      <Card className="mb-3" style={{ width: "80rem" }}>
        <Card.Header className={styles.cardHeader}>
          <Row>
            <Col>SWTD Details</Col>
            <Col className="text-end">
              <i
                className={`${styles.commentEdit} fa-solid fa-circle-info fa-lg`}
                onClick={openModal}></i>
            </Col>
          </Row>
        </Card.Header>
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
                <Col
                  className="d-flex justify-content-start align-items-start"
                  sm="11">
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

            <Row className="w-100">
              {/* Venue */}
              <Col>
                <Form.Group as={Row} className="mb-3" controlId="inputVenue">
                  <Form.Label className={styles.formLabel} column sm="2">
                    Venue
                  </Form.Label>
                  <Col sm="10">
                    <Form.Control
                      type="text"
                      className={styles.formBox}
                      name="venue"
                      onChange={handleChange}
                      value={form.venue}
                    />
                  </Col>
                </Form.Group>
              </Col>

              {/* Category */}
              <Col>
                <Form.Group as={Row} className="mb-3" controlId="inputCategory">
                  <Form.Label
                    className={`${styles.formLabel} text-end`}
                    column
                    sm="2">
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
                      {categories.categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Form.Group>
              </Col>
            </Row>

            <Row className="w-100">
              {/* Term */}
              <Col>
                <Form.Group as={Row} className="mb-3" controlId="inputTerm">
                  <Form.Label className={`${styles.formLabel}`} column sm="2">
                    Term
                  </Form.Label>
                  <Col sm="10">
                    <Form.Select
                      className={styles.formBox}
                      name="term_id"
                      onChange={handleChange}
                      value={form.term_id}>
                      <option value={0} disabled>
                        Select a term
                      </option>
                      {terms.map((term, index) => (
                        <option key={index} value={term.id}>
                          {term.name} ({formatTermDate(term.start_date)} to{" "}
                          {formatTermDate(term.end_date)})
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
                      min={selectedTerm ? selectedTerm.start : ""}
                      max={
                        selectedTerm?.ongoing
                          ? new Date().toISOString().slice(0, 10)
                          : selectedTerm.end
                      }
                      className={styles.formBox}
                      name="date"
                      onChange={handleChange}
                      value={form.date}
                      isInvalid={
                        !isEmpty(form.date) &&
                        !isValidSWTDDate(form.date, selectedTerm)
                      }
                      disabled={form.term_id === 0}
                    />
                    <Form.Control.Feedback type="invalid">
                      Date must be valid and within the selected term.
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>
              </Col>

              {/* Time */}
              <Col>
                <Form.Group as={Row} className="mb-3" controlId="inputTime">
                  <Form.Label
                    className={`${styles.formLabel} text-end`}
                    column
                    sm="2">
                    Time
                  </Form.Label>
                  <Col className="text-start" sm="4">
                    <Form.Control
                      type="time"
                      className={styles.formBox}
                      name="time_started"
                      onChange={handleChange}
                      value={form.time_started}
                      isInvalid={isTimeInvalid()}
                      disabled={form?.category.startsWith("Degree")}
                    />
                    <Form.Control.Feedback type="invalid">
                      Time must be valid.
                    </Form.Control.Feedback>
                  </Col>
                  <Col
                    className="d-flex justify-content-center align-items-center"
                    sm="1">
                    to
                  </Col>
                  <Col sm="4">
                    <Form.Control
                      type="time"
                      className={styles.formBox}
                      name="time_finished"
                      onChange={handleChange}
                      value={form.time_finished}
                      isInvalid={isTimeInvalid()}
                      disabled={form?.category.startsWith("Degree")}
                    />
                  </Col>
                </Form.Group>
              </Col>
            </Row>

            {/* Proof */}
            <Row className="w-100">
              <Col>
                <Form.Group as={Row} className="mb-3" controlId="inputProof">
                  <Form.Label className={`${styles.formLabel}`} column sm="2">
                    Proof
                  </Form.Label>
                  <Col sm="6">
                    <Form.Control
                      type="file"
                      className={styles.formBox}
                      name="proof"
                      onChange={handleProof}
                      ref={inputFile}
                      isInvalid={isProofInvalid}
                    />
                  </Col>
                  <Col className="d-flex align-items-center">
                    <Form.Text muted>PDFs, PNG, JPG/JPEG only.</Form.Text>
                  </Col>
                </Form.Group>
              </Col>

              {/* Points */}
              <Col>
                <Form.Group as={Row} className="mb-3" controlId="inputPoints">
                  <Form.Label
                    className={`${styles.formLabel} text-end`}
                    column
                    sm="2">
                    Points
                  </Form.Label>

                  {form?.category.startsWith("Degree") ? (
                    <>
                      <Col sm="3">
                        <Form.Control
                          type="number"
                          className={`${styles.pointsBox} text-center`}
                          name="points"
                          onChange={handleChange}
                          value={form.points}
                          isInvalid={form.points <= 0}
                        />
                      </Col>
                      <Col className="d-flex align-items-center">
                        <Form.Text muted>
                          Enter the points for this submission.
                        </Form.Text>
                      </Col>
                    </>
                  ) : (
                    <>
                      <Col sm="2">
                        <Form.Control
                          className={`${styles.pointsBox} text-center`}
                          name="points"
                          onChange={handleChange}
                          value={form.points}
                          readOnly
                        />
                      </Col>
                      <Col className="d-flex align-items-center">
                        <Form.Text muted>
                          Points will be calculated automatically.
                        </Form.Text>
                      </Col>
                    </>
                  )}
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
                <BtnPrimary
                  onClick={handleSubmit}
                  disabled={invalidFields()}
                  title={invalidFields() ? "All fields are required." : ""}>
                  Submit
                </BtnPrimary>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddSWTD;
