import React, { useState, useContext, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, Card, Form, Modal, Spinner, FloatingLabel } from "react-bootstrap"; /* prettier-ignore */

import SessionUserContext from "../../contexts/SessionUserContext";
import categories from "../../data/categories.json";
import { getClearanceStatus } from "../../api/user";
import { getTerms } from "../../api/admin";
import { addSWTD } from "../../api/swtd";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { formatDate, apiDate, monthYearDate } from "../../common/format/date";
import { isEmpty, isValidSWTDDate } from "../../common/validation/utils";
import { calculateHourPoints } from "../../common/validation/points";

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
  const [userDepartment, setUserDepartment] = useState({
    semester: false,
    midyear: false,
    academic: false,
  });
  const [selectedTerm, setSelectedTerm] = useState({
    start: "",
    end: "",
    ongoing: false,
  });
  const [terms, setTerms] = useState([]);
  const [invalidTerm, setInvalidTerm] = useState(false);
  const [checkbox, setCheckBox] = useState({
    deliverable: false,
  });
  const [form, setForm] = useState({
    author_id: id,
    title: "",
    venue: "",
    category: "",
    term_id: 0,
    start_date: "",
    end_date: "",
    total_hours: 0,
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

    setForm({
      ...form,
      title: "",
      venue: "",
      category: "",
      term_id: 0,
      start_date: "",
      end_date: "",
      total_hours: "",
      points: 0,
      proof: "",
      benefits: "",
      has_deliverables: checkbox.deliverable,
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

  const handleChange = (e) => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;

    if (e.target.name === "category" && e.target.value.startsWith("Degree")) {
      setForm({
        ...form,
        time_started: "00:00",
        time_ended: "00:00",
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
    const requiredFields = ["title", "venue", "category", "benefits"];
    return (
      requiredFields.some((field) => isEmpty(form[field])) ||
      form.term_id === 0 ||
      !form.proof ||
      form.points <= 0 ||
      invalidTerm
    );
  };

  const handleSubmit = async () => {
    //Change date format from YYYY-MM-DD to MM-DD-YYYY
    const formattedStartDate = apiDate(form.start_date);
    const formattedEndDate = apiDate(form.end_date);

    const updatedForm = {
      ...form,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
    };

    await addSWTD(
      { ...updatedForm, token: accessToken },
      (response) => {
        setTimeout(() => {
          triggerShowSuccess(4500);
          clearForm();
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
    getTerms(
      {
        token: accessToken,
      },
      (response) => {
        let filteredTerms = response.terms;
        const validTypes = [
          ...(userDepartment.semester ? ["SEMESTER"] : []),
          ...(userDepartment.midyear ? ["MIDYEAR/SUMMER"] : []),
          ...(userDepartment.academic ? ["ACADEMIC YEAR"] : []),
        ];

        if (validTypes.length > 0) {
          filteredTerms = filteredTerms.filter((term) =>
            validTypes.includes(term.type)
          );
        }

        setTerms(filteredTerms);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  //USEEFFECT FOR CALCULATING POINTS
  useEffect(() => {
    const allEntriesFilled =
      !isEmpty(form.start_date) &&
      !isEmpty(form.end_date) &&
      form.total_hours > 0;
    if (allEntriesFilled && !checkbox.deliverable) {
      const totalPoints = calculateHourPoints(
        form?.category,
        form?.total_hours
      );

      setForm((prevForm) => ({
        ...prevForm,
        points: totalPoints,
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
      }));
    }
  }, [form.category, checkbox.deliverable]);

  useEffect(() => {
    if (!user?.department) navigate("/swtd");
    setUserDepartment({
      ...userDepartment,
      semester: user?.department?.use_schoolyear === false ? true : false,
      midyear: user?.department?.midyear_points > 0 ? true : false,
      academic: user?.department?.use_schoolyear,
    });

    setForm((prevForm) => ({
      ...prevForm,
      author_id: user?.id,
    }));
  }, [user]);

  useEffect(() => {
    fetchTerms();
  }, [userDepartment]);

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
        <Col md="auto">
          <h3 className={styles.label}>
            <i
              className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
              onClick={() => navigate("/swtd")}></i>{" "}
            Add a New Record
          </h3>
        </Col>
      </Row>

      <Card className="mb-3" style={{ width: "80rem" }}>
        <Card.Header className={styles.cardHeader}>
          <Row>
            <Col>SWTD Details</Col>
            <Col className="text-end">
              <i
                className={`${styles.commentEdit} fa-solid fa-circle-info fa-sm`}
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
                    {terms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.name} ({monthYearDate(term.start_date)} to{" "}
                        {monthYearDate(term.end_date)})
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

            {/* CATEGORY, POINTS, CHECKBOX */}
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

              <Col md="2">
                <FloatingLabel
                  controlId="floatingInputPoints"
                  label="Points"
                  className="mb-3">
                  <Form.Control
                    type="number"
                    min={0}
                    placeholder="Points"
                    className={styles.pointsBox}
                    name="points"
                    onChange={handleChange}
                    value={form.points}
                    disabled={loading}
                    readOnly={
                      !form?.category.startsWith("Degree") &&
                      !checkbox.deliverable
                    }
                  />
                  <Form.Text>
                    {checkbox.deliverable || form?.category.startsWith("Degree")
                      ? "Enter points for this SWTD."
                      : "Calculated automatically."}
                  </Form.Text>
                </FloatingLabel>
              </Col>

              <Col className="d-flex p-3">
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
            </Row>

            {/* DATE & TIME */}
            <Row className="mb-2">
              <Col className={`p-1 ${styles.categoryLabel}`} md="4">
                <span className="ms-1">DATE & TIME</span>
              </Col>
            </Row>

            {/* DATE + TIME ROW */}
            <Row className="mb-4">
              {/* DATE */}
              <Col md="3">
                <FloatingLabel
                  controlId={`floatingInputStartDate`}
                  label="Start Date"
                  className="mb-3">
                  <Form.Control
                    type="date"
                    min={selectedTerm?.start_date}
                    max={
                      selectedTerm?.ongoing
                        ? new Date().toISOString().slice(0, 10)
                        : selectedTerm.end
                    }
                    className={styles.formBox}
                    onChange={handleChange}
                    value={form.start_date}
                    isInvalid={
                      !isEmpty(form.start_date) &&
                      !isValidSWTDDate(form.start_date, selectedTerm)
                    }
                    disabled={form.term_id === 0 || loading}
                  />
                </FloatingLabel>
              </Col>

              <Col md="3">
                <FloatingLabel
                  controlId={`floatingInputEndDate`}
                  label="End Date"
                  className="mb-3">
                  <Form.Control
                    type="date"
                    className={styles.formBox}
                    onChange={handleChange}
                    value={form.end_date}
                    isInvalid={
                      !isEmpty(form.end_date) &&
                      !isValidSWTDDate(form.end_date, selectedTerm)
                    }
                    disabled={form.term_id === 0 || loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    Date must be valid and within the selected term.
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>

              {/* HOURS */}
              {!form?.category.startsWith("Degree") && (
                <Col md="2">
                  <FloatingLabel
                    controlId={`floatingInputTotalHours`}
                    label="Total Hours"
                    className="mb-3">
                    <Form.Control
                      type="number"
                      className={styles.formBox}
                      min={0}
                      onChange={handleChange}
                      value={form.total_hours}
                      disabled={loading}
                    />
                  </FloatingLabel>
                </Col>
              )}
            </Row>

            {/* DOCUMENTATION */}
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
                    multiple
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
