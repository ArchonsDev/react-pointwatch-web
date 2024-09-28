import React, { useState, useEffect, useContext, useRef } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Form, Modal, Spinner, FloatingLabel } from "react-bootstrap";

import SessionUserContext from "../../contexts/SessionUserContext";
import departmentTypes from "../../data/departmentTypes.json";
import categories from "../../data/categories.json";
import roles from "../../data/roles.json";

import { formatDate, wordDate, apiDate } from "../../common/format/date";
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
      role: value,
    }));
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

        setCheckBox({
          ...checkbox,
          deliverable: data.has_deliverables,
        });

        getClearance(data.term.id);
        setNumDays(data.dates.length);

        //CHANGE DATE FORMAT FROM MM-DD-YYYY to YYYY-MM-DD
        const formattedDates = data.dates.map((dateEntry) => ({
          ...dateEntry,
          date: formatDate(dateEntry.date),
        }));

        setFormDates(formattedDates);
        setForm({
          ...data,
          selectedRole: data.role,
          term_id: data.term.id,
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
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;

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

  const invalidFields = () => {
    const requiredFields = ["title", "venue", "category", "role", "benefits"];
    return (
      requiredFields.some((field) => isEmpty(form[field])) ||
      form.term_id === 0 ||
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

  const handleSubmit = async () => {
    const formattedDates = formDates.map((dateEntry) => ({
      ...dateEntry,
      date: apiDate(dateEntry.date),
    }));

    // const datesString = JSON.stringify(formattedDates);

    const updatedForm = {
      ...form,
      dates: formattedDates,
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

  useEffect(() => {
    const allEntriesFilled = formDates.every(
      (dateEntry) =>
        !isEmpty(dateEntry.date) &&
        !isEmpty(dateEntry.time_started) &&
        !isEmpty(dateEntry.time_ended)
    );

    if (allEntriesFilled) {
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
  }, [formDates, form.category]);

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
                  You are already cleared for this term. Please select another.
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
                      isInvalid={dateEntry.time_started > dateEntry.time_ended}
                      disabled={form?.category.startsWith("Degree") || loading}
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
                      isInvalid={dateEntry.time_started > dateEntry.time_ended}
                      disabled={form?.category.startsWith("Degree") || loading}
                    />
                  </FloatingLabel>
                </Col>
              </Row>
            ))}
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
