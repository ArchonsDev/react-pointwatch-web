import React, { useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Form, Modal, Spinner, FloatingLabel } from "react-bootstrap";

import SessionUserContext from "../../contexts/SessionUserContext";
import departmentTypes from "../../data/departmentTypes.json";
import categories from "../../data/categories.json";
import roles from "../../data/roles.json";

import { formatDate, wordDate } from "../../common/format/date";
import { isEmpty, isValidSWTDDate } from "../../common/validation/utils";
import { calculateHourPoints } from "../../common/validation/points"; /* prettier-ignore */
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { getClearanceStatus } from "../../api/user";
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
  const [checkbox, setCheckBox] = useState({
    day: false,
    deliverable: false,
  });
  const [form, setForm] = useState({
    title: "",
    venue: "",
    category: "",
    term_id: 0,
    role: "",
    date: "",
    time_started: "",
    time_finished: "",
    points: "",
    benefits: "",
  });

  const handleBoxChange = (e) => {
    const { id, checked } = e.target;
    setCheckBox({
      ...checkbox,
      [id]: checked,
    });

    if (!checkbox.day) {
      setForm({
        ...form,
        end_date: "",
      });
    }
  };

  const fetchTerms = () => {
    const allowedTerm = departmentTypes[user?.department];
    getTerms(
      {
        token: token,
      },
      (response) => {
        const filteredTerms = response.terms.filter((term) =>
          allowedTerm.includes(term.type)
        );
        setTerms(filteredTerms);
        fetchSWTD();
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const setTerm = (term_id) => {
    if (!term_id) return;
    const term = terms.find((term) => term.id === term_id);

    const formattedStartDate = formatDate(term?.start_date);
    const formattedEndDate = formatDate(term?.end_date);
    setSelectedTerm({
      start: formattedStartDate,
      end: formattedEndDate,
      ongoing: term?.is_ongoing,
    });
  };

  const fetchSWTD = () => {
    getSWTD(
      {
        token: token,
        form_id: swtd_id,
      },
      (response) => {
        const data = response.data;
        if (id !== data.author_id) {
          navigate("/swtd");
          return;
        }
        const formattedDate = formatDate(data.date);
        getClearance(data.term.id);
        setForm({
          ...data,
          selectedRole: data.role,
          term_id: data.term.id,
          date: formattedDate,
        });
        setLoading(false);
      },
      (error) => {
        console.log("Error fetching SWTD data: ", error);
        setLoading(false);
      }
    );
  };

  const getClearance = (term_id) => {
    getClearanceStatus(
      {
        id: id,
        term_id: term_id,
        token: token,
      },
      (response) => {
        setInvalidTerm(response.is_cleared);
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category" && value.startsWith("Degree")) {
      setForm((prevForm) => ({
        ...prevForm,
        time_started: "00:00",
        time_finished: "00:00",
        points: 0,
        [name]: value,
      }));
    } else if (name === "term_id") {
      const selectedTermId = parseInt(value, 10);
      setTerm(selectedTermId);
      getClearance(selectedTermId);
      setForm((prevForm) => ({
        ...prevForm,
        date: "",
        [name]: value,
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
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
      "time_started",
      "time_finished",
      "benefits",
    ];
    return (
      requiredFields.some((field) => isEmpty(form[field])) ||
      isTimeInvalid() ||
      !isValidSWTDDate(form.date, selectedTerm) ||
      form.term_id === 0 ||
      form.points === 0 ||
      invalidTerm
    );
  };

  const handleSubmit = async () => {
    if (!isEmpty(form.date)) {
      const [year, month, day] = form.date.split("-");
      form.date = `${month}-${day}-${year}`;
    }

    await editSWTD(
      {
        id: swtd_id,
        ...form,
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

  const getHourPoints = (name, start, finish) => {
    const total = calculateHourPoints(name, start, finish);
    setForm({
      ...form,
      points: total,
    });
  };

  useEffect(() => {
    const isFormValid =
      !isEmpty(form.category) &&
      !form.category.startsWith("Degree") &&
      !isEmpty(form.time_started) &&
      !isEmpty(form.time_finished);
    if (isFormValid) {
      getHourPoints(form.category, form.time_started, form.time_finished);
    } else form.points = 0;
  }, [form.category, form.time_started, form.time_finished]);

  useEffect(() => {
    fetchTerms();
  }, []);

  useEffect(() => {
    if (terms.length > 0 && form.term_id) {
      setTerm(form.term_id);
    }
  }, [terms, form.term_id]);

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
          {/* POINTS */}
          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputPoints">
              <Form.Label className={`${styles.formLabel}`} column sm="1">
                Points
              </Form.Label>

              {form?.category.startsWith("Degree") ? (
                <>
                  <Col md="1">
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
                  <Col md="1">
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
          </Row>

          {/* CHECKBOXES */}
          <Row className="mb-3">
            <Col>
              <Form.Check
                inline
                type="checkbox"
                id="day"
                checked={checkbox.day}
                onChange={handleBoxChange}
              />
              <Form.Check.Label>Is the SWTD more than 1 day?</Form.Check.Label>
            </Col>

            <Col>
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

          {/* TITLE */}
          <>
            <FloatingLabel
              controlId="floatingInputTitle"
              label="Title"
              className="mb-3">
              <Form.Control
                type="text"
                className={styles.formBox}
                name="title"
                onChange={handleChange}
                value={form.title}
                isInvalid={isEmpty(form.title)}
              />
              <Form.Control.Feedback type="invalid">
                Title of SWTD is required.
              </Form.Control.Feedback>
            </FloatingLabel>
          </>

          {/* VENUE & TERM */}
          <Row>
            {/* VENUE */}
            <Col>
              <FloatingLabel
                controlId="floatingInputVenue"
                label="Venue"
                className="mb-3">
                <Form.Control
                  type="text"
                  className={styles.formBox}
                  name="venue"
                  onChange={handleChange}
                  value={form.venue}
                  isInvalid={isEmpty(form.venue)}
                />
                <Form.Control.Feedback type="invalid">
                  Venue of SWTD is required.
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>

            {/* TERM */}
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
                  isInvalid={invalidTerm === true}>
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
                  You are already cleared for this term. Please select another.
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>
          </Row>

          {/* CATEGORY & ROLE */}
          <Row>
            {/* CATEGORY */}
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

            {/* ROLE */}
            <Col md="3">
              <FloatingLabel
                controlId="floatingSelectRole"
                label="Role"
                className="mb-3">
                <Form.Select
                  className={styles.formBox}
                  name="selectedRole"
                  onChange={handleChange}
                  value={form.selectedRole}
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
                  disabled={loading || !form.selectedRole.includes("Other")}
                />
              </FloatingLabel>
            </Col>
          </Row>

          {/* DATE & TIME */}
          <Row>
            <Col md="6">
              <FloatingLabel
                controlId="floatingInputDate"
                label="Date"
                className="mb-3">
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
                    isEmpty(form.date) ||
                    (!isEmpty(form.date) &&
                      !isValidSWTDDate(form.date, selectedTerm))
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {isEmpty(form.date) ? (
                    <>Date is required.</>
                  ) : (
                    <>Date must be valid and within the selected term.</>
                  )}
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>

            <Col md="3">
              <FloatingLabel
                controlId="floatingInputStartTime"
                label="Start Time"
                className="mb-3">
                <Form.Control
                  type="time"
                  className={styles.formBox}
                  name="time_started"
                  onChange={handleChange}
                  value={form.time_started}
                  disabled={form?.category.startsWith("Degree")}
                />
              </FloatingLabel>
            </Col>

            <Col md="3">
              <FloatingLabel
                controlId="floatingInputEndTime"
                label="End Time"
                className="mb-3">
                <Form.Control
                  type="time"
                  className={styles.formBox}
                  name="time_finished"
                  onChange={handleChange}
                  value={form.time_finished}
                  isInvalid={isTimeInvalid()}
                  disabled={form?.category.startsWith("Degree")}
                />
                <Form.Control.Feedback type="invalid">
                  Time must be valid.
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>
          </Row>

          {/* TAKEAWAYS */}
          <>
            <FloatingLabel
              controlId="floatingInputTakeaways"
              label="Benefits"
              className="mb-3">
              <Form.Control
                as="textarea"
                className={styles.formBox}
                style={{ minHeight: "100px" }}
                name="benefits"
                onChange={handleChange}
                value={form.benefits}
                isInvalid={isEmpty(form.benefits)}
              />
              <Form.Control.Feedback type="invalid">
                Benefits is required.
              </Form.Control.Feedback>
            </FloatingLabel>
          </>

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
