import React, { useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Form, Modal, Spinner } from "react-bootstrap";

import SessionUserContext from "../../contexts/SessionUserContext";
import departmentTypes from "../../data/departmentTypes.json";
import categories from "../../data/categories.json";
import roles from "../../data/roles.json";

import { formatDate, formatTermDate } from "../../common/format/date";
import { isEmpty, isValidSWTDDate } from "../../common/validation/utils";
import { calculatePoints } from "../../common/validation/points";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { getClearanceStatus } from "../../api/user";
import { getTerms } from "../../api/admin";
import { getSWTD, getSWTDProof, editSWTD } from "../../api/swtd";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import EditProofModal from "../../common/modals/EditProofModal";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";

const EditSWTD = ({ cancelEditing, updateSWTD, updateSuccess }) => {
  const { user } = useContext(SessionUserContext);
  const { swtd_id } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get("userToken");
  const id = parseInt(Cookies.get("userID"), 10);

  const [swtdProof, setSWTDProof] = useState(null);

  const [showModal, openModal, closeModal] = useSwitch();
  const [showProofModal, openProofModal, closeProofModal] = useSwitch();
  const [showEditProof, openEditProof, closeEditProof] = useSwitch();

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

  const fetchSWTDProof = () => {
    getSWTDProof(
      {
        form_id: swtd_id,
        token: token,
      },
      (response) => {
        const contentType = response.headers["content-type"];

        const uint8Array = new Uint8Array(response.data);
        const blob = new Blob([uint8Array], { type: contentType });
        const blobURL = URL.createObjectURL(blob);

        setSWTDProof({
          src: blobURL,
          type: contentType,
        });
      },
      (error) => {
        console.log("Error fetching SWTD data: ", error);
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

  const proofSuccess = async () => {
    triggerShowSuccess(3000);
    fetchSWTDProof();
  };

  const proofError = (message) => {
    setErrorMessage(message);
    triggerShowError(3000);
  };

  const getPoints = (name, start, finish) => {
    const total = calculatePoints(name, start, finish);
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
    if (isFormValid)
      getPoints(form.category, form.time_started, form.time_finished);
    else form.points = 0;
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
      {/* View Proof Modal */}
      <Modal show={showProofModal} onHide={closeProofModal} size="lg" centered>
        <Modal.Body className="d-flex justify-content-center align-items-center">
          <Row className="w-100">
            {swtdProof?.type.startsWith("image") && (
              <img
                src={swtdProof?.src}
                title="SWTD Proof"
                className={styles.imgProof}
                alt="SWTD Proof"
              />
            )}

            {swtdProof?.type === "application/pdf" && (
              <iframe
                src={swtdProof?.src}
                type="application/pdf"
                width="100%"
                height="650px"
                title="SWTD Proof PDF"
                aria-label="SWTD Proof PDF"></iframe>
            )}
          </Row>
        </Modal.Body>
      </Modal>
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

        {/* Title */}
        <Form noValidate>
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
                  isInvalid={isEmpty(form.title)}
                />
                <Form.Control.Feedback type="invalid">
                  Title of SWTD is required.
                </Form.Control.Feedback>
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
                    isInvalid={isEmpty(form.venue)}
                  />
                  <Form.Control.Feedback type="invalid">
                    Venue of SWTD is required.
                  </Form.Control.Feedback>
                </Col>
              </Form.Group>
            </Col>

            {/* Category */}
            <Col>
              <Form.Group as={Row} className="mb-3" controlId="inputCategory">
                <Form.Label className={styles.formLabel} column sm="2">
                  Category
                </Form.Label>

                <Col sm="10">
                  <Form.Select
                    className={styles.formBox}
                    name="category"
                    onChange={handleChange}
                    value={form.category}
                    isInvalid={isEmpty(form.category)}>
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Category of SWTD is required.
                  </Form.Control.Feedback>
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
                    value={form.term_id}
                    isInvalid={invalidTerm === true}>
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
                  <Form.Control.Feedback type="invalid">
                    You are already cleared for this term. Please select
                    another.
                  </Form.Control.Feedback>
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
                    value={form.role}
                    isInvalid={isEmpty(form.role)}>
                    <option value="" disabled>
                      Select a role
                    </option>
                    {roles.roles.map((role, index) => (
                      <option key={index} value={role}>
                        {role}
                      </option>
                    ))}
                  </Form.Select>

                  <Form.Control.Feedback type="invalid">
                    Role is required.
                  </Form.Control.Feedback>
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
                    disabled={form?.category.startsWith("Degree")}
                  />
                </Col>
                <Col
                  className="d-flex justify-content-center align-items-center text-center"
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
                  <Form.Control.Feedback type="invalid">
                    Time must be valid.
                  </Form.Control.Feedback>
                </Col>
              </Form.Group>
            </Col>
          </Row>

          <Row className="w-100">
            {/* Proof */}
            <Col>
              <Form.Group as={Row} className="mb-3" controlId="inputProof">
                <Form.Label className={styles.formLabel} column sm="2">
                  Proof
                </Form.Label>

                <Col className="d-flex justify-content-start align-items-center">
                  <Row className="w-100">
                    <Col className="text-start" md="auto">
                      <BtnPrimary
                        onClick={() => {
                          fetchSWTDProof();
                          openProofModal();
                        }}>
                        View
                      </BtnPrimary>
                    </Col>
                    <Col className="text-start">
                      <BtnSecondary onClick={() => openEditProof()}>
                        Change Proof
                      </BtnSecondary>
                    </Col>
                  </Row>
                </Col>
              </Form.Group>
              <EditProofModal
                show={showEditProof}
                onHide={closeEditProof}
                editSuccess={proofSuccess}
                editError={proofError}
              />
            </Col>

            {/* Points */}
            <Col className="text-end">
              <Form.Group as={Row} className="mb-3" controlId="inputPoints">
                <Form.Label className={styles.formLabel} column sm="2">
                  Points
                </Form.Label>

                {form?.category.startsWith("Degree") ? (
                  <>
                    <Col sm="2">
                      <Form.Control
                        type="number"
                        className={`${styles.pointsBox} text-center`}
                        name="points"
                        onChange={handleChange}
                        value={form.points}
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
                  isInvalid={isEmpty(form.benefits)}
                />
                <Form.Control.Feedback type="invalid">
                  Benefits is required.
                </Form.Control.Feedback>
              </Col>
            </Form.Group>
          </Row>

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
