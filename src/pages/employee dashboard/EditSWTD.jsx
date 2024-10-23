import React, { useState, useEffect, useContext, useRef } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Form, Modal, Spinner, FloatingLabel } from "react-bootstrap";

import SessionUserContext from "../../contexts/SessionUserContext";
import categories from "../../data/categories.json";

import { formatDate, apiDate, monthYearDate } from "../../common/format/date";
import { isEmpty, isValidSWTDDate } from "../../common/validation/utils";
import { calculateHourPoints } from "../../common/validation/points"; /* prettier-ignore */
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { getTerms } from "../../api/admin";
import { getSWTD, editSWTD } from "../../api/swtd";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";

const EditSWTD = ({ cancelEditing, updateSWTD, updateSuccess }) => {
  const { user } = useContext(SessionUserContext);
  const { swtd_id } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get("userToken");
  const id = parseInt(Cookies.get("userID"), 10);
  const textareaRef = useRef(null);

  const [showModal, openModal, closeModal] = useSwitch();

  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [showError, triggerShowError] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState({
    start: "",
    end: "",
    ongoing: false,
  });
  const [terms, setTerms] = useState([]);
  const [invalidTerm, setInvalidTerm] = useState(false);
  const [departmentTypes, setDepartmentTypes] = useState({
    semester: false,
    midyear: false,
    academic: false,
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
    benefits: "",
  });

  const fetchTerms = () => {
    getTerms(
      {
        token: token,
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

        setTerms(filteredTerms);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const setTerm = (term_id) => {
    if (!term_id) return;
    const term = terms.find((term) => term.id === term_id);
    const status = user?.clearances?.find(
      (clearance) => clearance.term.id === term_id
    );
    if (status) setInvalidTerm(status.is_deleted ? false : true);
    else setInvalidTerm(false);

    const formattedStartDate = formatDate(term?.start_date);
    const formattedEndDate = formatDate(term?.end_date);
    setSelectedTerm({
      id: term_id,
      start: formattedStartDate,
      end: formattedEndDate,
      ongoing: term?.is_ongoing,
    });
  };

  const fetchSWTD = () => {
    getSWTD(
      { token: token, form_id: swtd_id },
      (response) => {
        const data = response.data.swtd_form;
        if (id !== data.author.id) {
          navigate("/swtd");
          return;
        }

        if (terms.length > 0) {
          setTerm(data.term.id);
        }

        setForm({
          ...data,
          term_id: data.term.id,
          start_date: formatDate(data.start_date),
          end_date: formatDate(data.end_date),
        });

        setLoading(false);
      },
      (error) => {
        console.log("Error fetching SWTD data: ", error);
        setLoading(false);
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

  const handleChange = (e) => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;

    if (e.target.name === "category" && e.target.value.startsWith("Degree")) {
      setForm({
        ...form,
        [e.target.name]: e.target.value,
      });
    } else if (e.target.name === "term_id") {
      const selectedTermId = parseInt(e.target.value);
      const term = terms.find((term) => term.id === selectedTermId);

      if (term) {
        const status = user?.clearances.find(
          (clearance) => clearance.term.id === selectedTermId
        );
        if (status) setInvalidTerm(status?.is_deleted ? false : true);
        else setInvalidTerm(false);

        const formattedStartDate = formatDate(term.start_date);
        const formattedEndDate = formatDate(term.end_date);

        setSelectedTerm({
          id: selectedTermId,
          start: formattedStartDate,
          end: formattedEndDate,
          ongoing: term.is_ongoing,
        });
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

  const invalidFields = () => {
    const requiredFields = ["title", "venue", "category", "benefits"];
    return (
      requiredFields.some((field) => isEmpty(form[field])) ||
      form.term_id === 0 ||
      form.points <= 0 ||
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

    await editSWTD(
      {
        id: swtd_id,
        ...updatedForm,
        token: token,
      },
      (response) => {
        updateSuccess();
        cancelEditing();
        updateSWTD();
      },
      (error) => {
        if (error.response && error.response.data) {
          setErrorMessage(<>{error.message}</>);
          triggerShowError(3000);
        } else {
          setErrorMessage("An error occurred.");
          triggerShowError(3000);
        }
      }
    );
  };

  useEffect(() => {
    if (user)
      setDepartmentTypes({
        ...departmentTypes,
        semester: user?.department?.use_schoolyear === false ? true : false,
        midyear: user?.department?.midyear_points > 0 ? true : false,
        academic: user?.department?.use_schoolyear,
      });
  }, [user]);

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
    if (departmentTypes) fetchTerms();
  }, [departmentTypes]);

  useEffect(() => {
    if (selectedTerm) {
      const status = user?.clearances?.find(
        (clearance) => clearance.term.id === selectedTerm.id
      );
      if (status) setInvalidTerm(status?.is_deleted ? false : true);
      else setInvalidTerm(false);
    }
  }, [selectedTerm]);

  useEffect(() => {
    if (terms.length > 0) fetchSWTD();
  }, [terms]);

  if (loading)
    return (
      <Row
        className={`${styles.loading} d-flex justify-content-center align-items-center w-100`}>
        <Spinner className={`${styles.spinner} me-2`} animation="border" />
        Loading data...
      </Row>
    );

  return (
    <>
      <div>
        {showError && (
          <div className="alert alert-danger mb-3" role="alert">
            {errorMessage}
          </div>
        )}
        {showSuccess && (
          <div className="alert alert-success mb-3" role="alert">
            Details changed!
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
                  You are already cleared for this term. Please select another.
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
            <Col md="3">
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

            <Col md="3">
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
                  disabled={form.term_id === 0 || loading}
                />
                <Form.Control.Feedback type="invalid">
                  Date must be valid and within the selected term.
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>

            {/* HOURS */}

            <Col md="2">
              <FloatingLabel
                controlId={`floatingInputTotalHours`}
                label={
                  form?.category.startsWith("Degree") ? "Units" : "Total Hours"
                }
                className="mb-3">
                <Form.Control
                  type="number"
                  name="total_hours"
                  className={styles.formBox}
                  min={0}
                  onChange={handleChange}
                  value={form.total_hours}
                  disabled={loading}
                />
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
                  readOnly={!form?.category.startsWith("Degree")}
                />
                <Form.Text>Calculated automatically.</Form.Text>
              </FloatingLabel>
            </Col>
          </Row>

          {/* DOCUMENTATION */}
          <Row className="w-100 mb-1">
            <span className={styles.categoryLabel}>DOCUMENTATION</span>
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
                isInvalid={isEmpty(form.benefits)}
              />
              <Form.Control.Feedback type="invalid">
                Benefits is required.
              </Form.Control.Feedback>
            </FloatingLabel>
          </>

          {/* SAVE CHANGES */}
          <Row>
            <Col className="text-end">
              <BtnPrimary onClick={openModal} disabled={invalidFields()}>
                Save Changes
              </BtnPrimary>
            </Col>
          </Row>

          <ConfirmationModal
            show={showModal}
            onHide={closeModal}
            onConfirm={handleSubmit}
            header={"Update Details"}
            message={"Do you wish to save these changes?"}
          />
        </Form>
      </div>
    </>
  );
};

export default EditSWTD;
