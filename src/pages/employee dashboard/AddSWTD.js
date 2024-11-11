import React, { useState, useContext, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, Card, Form, Modal, Spinner, FloatingLabel } from "react-bootstrap"; /* prettier-ignore */

import SessionUserContext from "../../contexts/SessionUserContext";
import categories from "../../data/categories.json";
import { getTerms } from "../../api/admin";
import { addSWTD } from "../../api/swtd";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { formatDate, apiDate, monthYearDate } from "../../common/format/date";
import { isEmpty, isValidSWTDDate } from "../../common/validation/utils";
import { calculateHourPoints } from "../../common/validation/points";

import Categories from "../../common/info/Categories";
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
  const [departmentTypes, setDepartmentTypes] = useState({
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
    files: "",
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
      start_date: "",
      end_date: "",
      total_hours: 0,
      points: 0,
      files: "",
      benefits: "",
    });
  };

  const handleChange = (e) => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;

    if (e.target.name === "term_id") {
      const selectedTermId = parseInt(e.target.value, 10);
      const term = terms.find((term) => term.id === selectedTermId);

      if (term) {
        const formattedStartDate = formatDate(term.start_date);
        const formattedEndDate = formatDate(term.end_date);
        setSelectedTerm({
          id: selectedTermId,
          start: formattedStartDate,
          end: formattedEndDate,
          ongoing: term.is_ongoing,
        });

        const status = user?.clearances.find(
          (clearance) =>
            clearance.term.id === selectedTermId && !clearance.is_deleted
        );

        if (status) setInvalidTerm(true);
        else setInvalidTerm(false);
      }

      setForm({
        ...form,
        [e.target.name]: e.target.value,
        start_date: "",
        end_date: "",
      });
    } else {
      setForm({
        ...form,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleProof = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    const validFiles = files.filter((file) => allowedTypes.includes(file.type));
    if (validFiles.length > 0) {
      setForm({
        ...form,
        files: validFiles,
      });
      setIsProofInvalid(false);
    } else {
      inputFile.current.value = null;
      setIsProofInvalid(true);
    }
  };

  const invalidFields = () => {
    const requiredFields = [
      "title",
      "venue",
      "category",
      "benefits",
      "start_date",
      "end_date",
    ];
    return (
      requiredFields.some((field) => isEmpty(form[field])) ||
      form.term_id === 0 ||
      !form.files ||
      form.total_hours <= 0 ||
      validateDates(form.start_date, form.category, selectedTerm) ||
      validateDates(form.end_date, form.category, selectedTerm) ||
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

          setLoading(false);
        });
      },
      (error) => {
        console.log(error);
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
          ...(departmentTypes.semester ? ["SEMESTER"] : []),
          ...(departmentTypes.midyear ? ["MIDYEAR/SUMMER"] : []),
          ...(departmentTypes.academic ? ["ACADEMIC YEAR"] : []),
        ];

        if (validTypes.length > 0) {
          filteredTerms = filteredTerms.filter((term) =>
            validTypes.includes(term.type)
          );
        }

        const ongoingTerm = filteredTerms.find((term) => term.is_ongoing);
        const termToFormat = ongoingTerm || filteredTerms[0];

        const formattedStartDate = formatDate(termToFormat.start_date);
        const formattedEndDate = formatDate(termToFormat.end_date);
        setSelectedTerm({
          id: termToFormat.id,
          start: formattedStartDate,
          end: formattedEndDate,
          ongoing: termToFormat.is_ongoing,
        });

        setTerms(filteredTerms);
        setForm((prevForm) => ({
          ...prevForm,
          term_id: ongoingTerm.id || filteredTerms[0].id,
        }));
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const setMinDate = (category, term) => {
    if (category.startsWith("Degree")) return undefined;
    return term?.start;
  };

  const setMaxDate = (category, term) => {
    if (category.startsWith("Degree")) return undefined;
    if (term?.ongoing) return new Date().toISOString().slice(0, 10);
    return term?.end;
  };

  const validateDates = (date, category, term) => {
    if (category.startsWith("Degree")) return isEmpty(date);
    return isEmpty(date) && isValidSWTDDate(date, term);
  };

  useEffect(() => {
    if (!user?.department) navigate("/swtd");
    setDepartmentTypes({
      ...departmentTypes,
      semester: user?.department?.use_schoolyear === false,
      midyear: user?.department?.midyear_points > 0,
      academic: user?.department?.use_schoolyear,
    });

    setForm((prevForm) => ({
      ...prevForm,
      author_id: user?.id,
    }));
  }, [user]);

  useEffect(() => {
    fetchTerms();
  }, [departmentTypes]);

  //USEEFFECT FOR CALCULATING POINTS
  useEffect(() => {
    if (form.total_hours > 0) {
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
  }, [form.category, form.total_hours]);

  useEffect(() => {
    if (selectedTerm) {
      const status = user?.clearances?.find(
        (clearance) =>
          clearance.term.id === selectedTerm.id && !clearance.is_deleted
      );
      if (status) setInvalidTerm(true);
      else setInvalidTerm(false);
    }
  }, [selectedTerm]);

  return (
    <Container
      className={`${styles.container} d-flex flex-column justify-content-center align-items-center`}>
      {/* View Terms Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className={styles.formLabel}>
            Required Points & Compliance Schedule
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Categories />
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

      <Card className="w-100 mb-3">
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
              <Col lg={6} md={6} xs={12}>
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

              <Col lg={6} md={6} xs={12}>
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

            {/* CATEGORY */}
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
            </Row>

            {/* DURATION & POINTS LABEL */}
            <Row className="mb-2">
              <Col className={`p-1 ${styles.categoryLabel}`} md="4">
                <span className="ms-1">DURATION & POINTS</span>
              </Col>
            </Row>

            {/* DURATION & POINTS */}
            <Row className="mb-4">
              {/* DATE */}
              <Col lg={3} md={6} xs={12}>
                <FloatingLabel
                  controlId={`floatingInputStartDate`}
                  label="Start Date"
                  className="mb-3">
                  <Form.Control
                    type="date"
                    name="start_date"
                    min={setMinDate(form?.category, selectedTerm)}
                    max={setMaxDate(form?.category, selectedTerm)}
                    className={styles.formBox}
                    onChange={handleChange}
                    value={form.start_date}
                    isInvalid={validateDates(
                      form?.start_date,
                      form?.category,
                      selectedTerm
                    )}
                    disabled={form.term_id === 0 || loading}
                  />
                </FloatingLabel>
              </Col>

              <Col lg={3} md={6} xs={12}>
                <FloatingLabel
                  controlId={`floatingInputEndDate`}
                  label="End Date"
                  className="mb-3">
                  <Form.Control
                    type="date"
                    name="end_date"
                    min={form?.start_date}
                    max={setMaxDate(form?.category, selectedTerm)}
                    className={styles.formBox}
                    onChange={handleChange}
                    value={form.end_date}
                    isInvalid={validateDates(
                      form?.end_date,
                      form?.category,
                      selectedTerm
                    )}
                    disabled={isEmpty(form.start_date) || loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    Date must be valid and within the selected term.
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>

              {/* HOURS */}
              <Col lg={2} md={3} xs={6}>
                <FloatingLabel
                  controlId={`floatingInputHoursUnits`}
                  label={
                    form?.category.startsWith("Degree")
                      ? "Units"
                      : "Total Hours"
                  }
                  className="mb-3">
                  <Form.Control
                    type="number"
                    name="total_hours"
                    className={styles.formBox}
                    min={0}
                    onChange={handleChange}
                    value={form.total_hours}
                    disabled={
                      loading ||
                      isEmpty(form.start_date) ||
                      isEmpty(form.end_date)
                    }
                    isInvalid={form?.total_hours === 0}
                  />
                </FloatingLabel>
              </Col>

              <Col lg={2} md={3} xs={6}>
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
                    disabled
                  />
                  <Form.Text>Calculated automatically.</Form.Text>
                </FloatingLabel>
              </Col>
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
                    name="files"
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
