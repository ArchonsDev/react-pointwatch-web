import React, { useState, useContext, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, Card, Form, Modal, Spinner, FloatingLabel } from "react-bootstrap"; /* prettier-ignore */

import SessionUserContext from "../../contexts/SessionUserContext";
import departmentTypes from "../../data/departmentTypes.json";
import categories from "../../data/categories.json";
import roles from "../../data/roles.json";
import { getClearanceStatus } from "../../api/user";
import { getTerms } from "../../api/admin";
import { addSWTD } from "../../api/swtd";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { formatDate, wordDate, apiDate } from "../../common/format/date";
import { isEmpty, isValidSWTDDate } from "../../common/validation/utils";
import { calculateHourPoints } from "../../common/validation/points"; /* prettier-ignore */

import SWTDInfo from "./SWTDInfo";
import BtnPrimary from "../../common/buttons/BtnPrimary";
import styles from "./style.module.css";

const AddSWTD = () => {
  const { user } = useContext(SessionUserContext);
  const id = Cookies.get("userID");
  const accessToken = Cookies.get("userToken");
  const navigate = useNavigate();
  const inputFile = useRef(null);
  const textareaRef = useRef(null);

  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [showError, triggerShowError] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showModal, openModal, closeModal] = useSwitch();

  const [loading, setLoading] = useState(false);
  const [isProofInvalid, setIsProofInvalid] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState({
    start: "",
    end: "",
    ongoing: false,
  });
  const [selectedRole, setSelectedRole] = useState("");
  const [terms, setTerms] = useState([]);
  const [invalidTerm, setInvalidTerm] = useState(false);
  const [checkbox, setCheckBox] = useState({
    deliverable: false,
  });
  const [numDays, setNumDays] = useState(1);
  const [formDates, setFormDates] = useState([
    {
      date: "",
      time_started: "",
      time_ended: "",
    },
  ]);
  const [form, setForm] = useState({
    author_id: id,
    title: "",
    venue: "",
    category: "",
    term_id: 0,
    role: "",
    dates: formDates,
    points: 0,
    proof: "",
    benefits: "",
    has_deliverables: checkbox.deliverable,
  });

  let swtdPoints = 0;

  const clearForm = () => {
    if (inputFile.current) {
      inputFile.current.value = "";
      inputFile.current.type = "text";
      inputFile.current.type = "file";
    }

    setFormDates([
      {
        date: "",
        time_started: "",
        time_ended: "",
      },
    ]);

    setForm({
      ...form,
      title: "",
      venue: "",
      category: "",
      term_id: 0,
      role: "",
      dates: formDates,
      proof: "",
      benefits: "",
    });
  };

  const handleBoxChange = (e) => {
    const { id, checked } = e.target;
    setCheckBox({
      ...checkbox,
      [id]: checked,
    });

    setForm((prevForm) => ({
      ...prevForm,
      has_deliverables:
        id === "deliverable" ? checked : prevForm.has_deliverables,
    }));
  };

  const handleCustomRoleChange = (e) => {
    const value = e.target.value;
    setSelectedRole(value);
    setForm((prevForm) => ({
      ...prevForm,
      role: value === "Other" ? "" : value,
    }));
  };

  const handleChange = (e) => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;

    if (e.target.name === "category" && e.target.value.startsWith("Degree")) {
      setForm({
        ...form,
        time_started: "00:00",
        time_ended: "00:00",
        points: 0,
        [e.target.name]: e.target.value,
      });
    } else if (e.target.name === "term_id") {
      const selectedTermId = parseInt(e.target.value);
      const term = terms.find((term) => term.id === selectedTermId);

      if (term) {
        const formattedStartDate = formatDate(term.start_date);
        const formattedEndDate = formatDate(term.end_date);

        setSelectedTerm({
          start: formattedStartDate,
          end: formattedEndDate,
          ongoing: term.is_ongoing,
        });

        fetchClearanceStatus(term);
      }
      setForm({
        ...form,
        [e.target.name]: e.target.value,
      });
    } else {
      setForm({
        ...form,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleFormDatesChange = (index, field, value) => {
    const updatedFormDates = [...formDates];
    updatedFormDates[index] = {
      ...updatedFormDates[index],
      [field]: value,
    };

    setFormDates(updatedFormDates);

    setForm((prevForm) => ({
      ...prevForm,
      dates: updatedFormDates,
    }));
  };

  const handleDaysChange = (e) => {
    let newNumDays = parseInt(e.target.value, 10);
    if (newNumDays === 0) {
      newNumDays = 1;
    }
    setNumDays(newNumDays);

    const updatedFormDates = [...formDates];
    while (updatedFormDates.length < newNumDays) {
      updatedFormDates.push({ date: "", time_started: "", time_ended: "" });
    }
    while (updatedFormDates.length > newNumDays) {
      updatedFormDates.pop();
    }
    setFormDates(updatedFormDates);
    setForm({
      ...form,
      dates: updatedFormDates,
    });
  };

  const fetchClearanceStatus = (term) => {
    getClearanceStatus(
      {
        id: id,
        term_id: term.id,
        token: accessToken,
      },
      (response) => {
        if (response.is_cleared === true) {
          setInvalidTerm(true);
        } else {
          setInvalidTerm(false);
        }
      }
    );
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

  const invalidFields = () => {
    const requiredFields = ["title", "venue", "category", "role", "benefits"];
    return (
      requiredFields.some((field) => isEmpty(form[field])) ||
      form.term_id === 0 ||
      !form.proof ||
      form.points <= 0 ||
      invalidTerm
    );
  };

  const getMinDate = (index, formDates, selectedTerm) => {
    if (index > 0 && formDates[index - 1]?.date) {
      const previousDate = new Date(formDates[index - 1].date);
      previousDate.setDate(previousDate.getDate() + 1);
      return previousDate.toISOString().split("T")[0];
    }
    return selectedTerm ? selectedTerm.start : "";
  };

  const getHourPoints = (name, start, finish) => {
    return calculateHourPoints(name, start, finish);
  };

  const calculateTotalPoints = () => {
    swtdPoints = 0;
    formDates.forEach((dateEntry, index) => {
      const isFormValid =
        !isEmpty(form.category) &&
        !form.category.startsWith("Degree") &&
        !isEmpty(dateEntry.date) &&
        !isEmpty(dateEntry.time_started) &&
        !isEmpty(dateEntry.time_ended);

      if (isFormValid) {
        const points = getHourPoints(
          form.category,
          dateEntry.time_started,
          dateEntry.time_ended
        );
        swtdPoints += points;
      }
    });

    return swtdPoints;
  };

  const handleSubmit = async () => {
    //Change date format from YYYY-MM-DD to MM-DD-YYYY
    const formattedDates = formDates.map((dateEntry) => ({
      ...dateEntry,
      date: apiDate(dateEntry.date),
    }));

    const datesString = JSON.stringify(formattedDates);

    const updatedForm = {
      ...form,
      dates: datesString,
    };

    await addSWTD(
      { ...updatedForm, token: accessToken },
      (response) => {
        setTimeout(() => {
          triggerShowSuccess(4500);
          clearForm();
          setNumDays(1);
          setCheckBox({
            ...checkbox,
            deliverable: false,
          });
          setLoading(false);
        });
      },
      (error) => {
        if (error.response && error.response.data) {
          setErrorMessage(<>{error.message}</>);
          triggerShowError(4500);
          setForm({
            ...form,
          });
          setLoading(false);
        } else {
          setErrorMessage(<>An error occurred.</>);
          triggerShowError(4500);
          setLoading(false);
        }
      }
    );
  };

  const fetchTerms = () => {
    const allowedTerm = departmentTypes[user?.department];
    getTerms(
      {
        token: accessToken,
      },
      (response) => {
        const filteredTerms = response.terms.filter((term) =>
          allowedTerm.includes(term.type)
        );
        setTerms(filteredTerms);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  //USEEFFECT FOR CALCULATING POINTS
  useEffect(() => {
    const allEntriesFilled = formDates.every(
      (dateEntry) =>
        !isEmpty(dateEntry.date) &&
        !isEmpty(dateEntry.time_started) &&
        !isEmpty(dateEntry.time_ended)
    );

    if (allEntriesFilled && !checkbox.deliverable) {
      const totalPoints = calculateTotalPoints();
      setForm((prevForm) => ({
        ...prevForm,
        points: totalPoints,
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        points: 0,
      }));
    }
  }, [formDates, form.category, checkbox.deliverable]);

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

      <Row className="w-100 mb-2">
        <Col>
          <h3 className={styles.label}>
            <i
              className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
              onClick={() => navigate("/swtd")}></i>{" "}
            Add a New Record
          </h3>
        </Col>
        <Col className="text-end">
          <i
            className={`${styles.commentEdit} fa-solid fa-circle-info fa-lg`}
            onClick={openModal}></i>
        </Col>
      </Row>

      <Card className="mb-3" style={{ width: "80rem" }}>
        <Card.Header className={styles.cardHeader}>
          <Row>
            <Col>SWTD Details</Col>
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
            {/* POINTS & CHECKBOX */}
            <Row className="mb-3">
              <Form.Group as={Row} className="mb-3" controlId="inputPoints">
                <Form.Label className={`${styles.formLabel}`} column md="auto">
                  Points
                </Form.Label>

                {form?.category.startsWith("Degree") || checkbox.deliverable ? (
                  <>
                    <Col md="2">
                      <Form.Control
                        type="number"
                        className={`${styles.pointsBox} text-center`}
                        name="points"
                        onChange={handleChange}
                        value={form.points}
                        isInvalid={form.points <= 0}
                        disabled={loading}
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
                    <Col md="2">
                      <Form.Control
                        type="number"
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
                <Col className="d-flex align-items-center">
                  <Form.Check
                    inline
                    type="checkbox"
                    id="deliverable"
                    checked={checkbox.deliverable}
                    onChange={handleBoxChange}
                  />
                  <Form.Check.Label>
                    Does the SWTD have deliverables?
                  </Form.Check.Label>
                </Col>
              </Form.Group>
            </Row>

            {/* GENERAL INFORMATION */}
            <Row className="mb-2">
              <Col className={`p-1 ${styles.categoryLabel}`}>
                <span className="ms-1">GENERAL INFORMATION</span>
              </Col>
            </Row>

            {/* TITLE */}
            <>
              <FloatingLabel
                controlId="floatingInputTitle"
                label="Title"
                className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Title"
                  name="title"
                  className={styles.formBox}
                  onChange={handleChange}
                  value={form.title}
                  disabled={loading}
                />
              </FloatingLabel>
            </>

            {/* VENUE & TERM */}
            <Row>
              <Col>
                <FloatingLabel
                  controlId="floatingInputVenue"
                  label="Venue"
                  className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Venue"
                    className={styles.formBox}
                    name="venue"
                    onChange={handleChange}
                    value={form.venue}
                    disabled={loading}
                  />
                </FloatingLabel>
              </Col>

              <Col>
                <FloatingLabel
                  controlId="floatingSelectTerm"
                  label="Term"
                  className="mb-3">
                  <Form.Select
                    className={styles.formBox}
                    name="term_id"
                    onChange={handleChange}
                    value={form.term_id}
                    isInvalid={invalidTerm}
                    disabled={loading}>
                    <option value={0} disabled>
                      Select a term
                    </option>
                    {terms.map((term, index) => (
                      <option key={index} value={term.id}>
                        {term.name} ({wordDate(term.start_date)} to{" "}
                        {wordDate(term.end_date)})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    You are already cleared for this term. Please select
                    another.
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>
            </Row>

            {/* CATEGORY & ROLE */}
            <Row className="mb-4">
              <Col md="6">
                <FloatingLabel
                  controlId="floatingInputCategory"
                  label="Category"
                  className="mb-3">
                  <Form.Select
                    className={styles.formBox}
                    name="category"
                    onChange={handleChange}
                    value={form.category}
                    disabled={loading}>
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </FloatingLabel>
              </Col>

              <Col md="3">
                <FloatingLabel
                  controlId="floatingSelectRole"
                  label="Role"
                  className="mb-3">
                  <Form.Select
                    className={styles.formBox}
                    name="role"
                    onChange={handleCustomRoleChange}
                    value={selectedRole}
                    disabled={loading}>
                    <option value="" disabled>
                      Select a role
                    </option>
                    {roles.roles.map((role, index) => (
                      <option key={index} value={role}>
                        {role}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>

              {selectedRole === "Other" && (
                <Col md="3">
                  <FloatingLabel
                    controlId="floatingInputOther"
                    label="Enter role"
                    className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Enter role"
                      name="role"
                      className={styles.formBox}
                      onChange={handleChange}
                      value={form.role}
                      disabled={loading}
                    />
                  </FloatingLabel>
                </Col>
              )}
            </Row>

            {/* DATE & TIME */}
            <Row className="mb-2">
              <Col className={`p-1 ${styles.categoryLabel}`} md="4">
                <span className="ms-1">DATE & TIME</span>
              </Col>
            </Row>

            {/* ENTER DAYS */}
            <Row className="mb-2">
              <Col md="2">
                <FloatingLabel
                  controlId="floatingInputDays"
                  label="SWTD Duration (Days)"
                  className="mb-3">
                  <Form.Control
                    type="number"
                    min="1"
                    className={styles.formBox}
                    value={numDays}
                    onChange={handleDaysChange}
                    disabled={loading}
                  />
                </FloatingLabel>
              </Col>
            </Row>

            {/* DATE + TIME ROW */}
            <Row className="mb-4">
              {formDates.map((dateEntry, index) => (
                <Row key={index} className="mb-2">
                  {/* DATE */}
                  <Col md="6">
                    <FloatingLabel
                      controlId={`floatingInputDate-${index}`}
                      label="Date"
                      className="mb-3">
                      <Form.Control
                        type="date"
                        min={getMinDate(index, formDates, selectedTerm)}
                        max={
                          selectedTerm?.ongoing
                            ? new Date().toISOString().slice(0, 10)
                            : selectedTerm.end
                        }
                        className={styles.formBox}
                        onChange={(e) =>
                          handleFormDatesChange(index, "date", e.target.value)
                        }
                        value={dateEntry.date}
                        isInvalid={
                          !isEmpty(dateEntry.date) &&
                          !isValidSWTDDate(dateEntry.date, selectedTerm)
                        }
                        disabled={form.term_id === 0 || loading}
                      />
                      <Form.Control.Feedback type="invalid">
                        Date must be valid and within the selected term.
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>

                  {/* Start Time */}
                  <Col md="3">
                    <FloatingLabel
                      controlId={`floatingInputStartTime-${index}`}
                      label="Start Time"
                      className="mb-3">
                      <Form.Control
                        type="time"
                        className={styles.formBox}
                        onChange={(e) =>
                          handleFormDatesChange(
                            index,
                            "time_started",
                            e.target.value
                          )
                        }
                        value={dateEntry.time_started || ""}
                        isInvalid={
                          dateEntry.time_started > dateEntry.time_ended
                        }
                        disabled={
                          form?.category.startsWith("Degree") || loading
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        Time must be valid.
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>

                  {/* End Time */}
                  <Col md="3">
                    <FloatingLabel
                      controlId={`floatingInputEndTime-${index}`}
                      label="End Time"
                      className="mb-3">
                      <Form.Control
                        type="time"
                        className={styles.formBox}
                        onChange={(e) =>
                          handleFormDatesChange(
                            index,
                            "time_ended",
                            e.target.value
                          )
                        }
                        value={dateEntry.time_ended || ""}
                        isInvalid={
                          dateEntry.time_started > dateEntry.time_ended
                        }
                        disabled={
                          form?.category.startsWith("Degree") || loading
                        }
                      />
                    </FloatingLabel>
                  </Col>
                </Row>
              ))}
            </Row>
            {/* TIME */}
            <Row className="w-100 mb-1">
              <span className={styles.categoryLabel}>DOCUMENTATION</span>
            </Row>

            {/* PROOF */}
            <Row>
              <Col md="6">
                <FloatingLabel
                  controlId="floatingInputProof"
                  label="Proof"
                  className="mb-3">
                  <Form.Control
                    type="file"
                    className={styles.formBox}
                    name="proof"
                    onChange={handleProof}
                    ref={inputFile}
                    isInvalid={isProofInvalid}
                    disabled={loading}
                  />
                </FloatingLabel>
              </Col>

              <Col className="d-flex align-items-center">
                <Form.Text muted>
                  PDFs, PNG, JPG/JPEG only (Max: 5MB).
                </Form.Text>
              </Col>
            </Row>

            {/* TAKEAWAYS */}
            <>
              <FloatingLabel
                controlId="floatingInputTakeaways"
                label={`Takeaways (${
                  2000 - form.benefits.length
                } characters remaining)`}
                className="mb-3">
                <Form.Control
                  as="textarea"
                  name="benefits"
                  ref={textareaRef}
                  className={styles.formBox}
                  style={{ wordWrap: "break-word", overflow: "hidden" }}
                  onChange={handleChange}
                  value={form.benefits}
                  maxLength={2000}
                  disabled={loading}
                />
              </FloatingLabel>
            </>

            <Row>
              <Col className="text-end">
                {loading ? (
                  <div
                    className={`${styles.msg} d-flex justify-content-end align-items-center`}>
                    <Spinner className={`me-2`} animation="border" />
                    Submitting SWTD...
                  </div>
                ) : (
                  <BtnPrimary
                    onClick={() => {
                      handleSubmit();
                      setLoading(true);
                    }}
                    disabled={invalidFields()}
                    title={invalidFields() ? "All fields are required." : ""}>
                    Submit
                  </BtnPrimary>
                )}
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddSWTD;
