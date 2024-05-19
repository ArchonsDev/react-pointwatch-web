import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Container, Card, Form, Modal } from "react-bootstrap"; /* prettier-ignore */

import Comments from "./Comments";
import categories from "../../data/categories.json";
import roles from "../../data/roles.json";

import { formatDate, formatTermDate } from "../../common/format/date";
import { isEmpty, isValidSWTDDate } from "../../common/validation/utils";
import { calculatePoints } from "../../common/validation/points";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { getClearanceStatus } from "../../api/user";
import { getTerms } from "../../api/admin";
import { getSWTD, getSWTDProof, getSWTDValidation, editSWTD, deleteSWTD } from "../../api/swtd"; /* prettier-ignore */

import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import EditProofModal from "../../common/modals/EditProofModal";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";

const EditSWTD = () => {
  const { swtd_id } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get("userToken");
  const id = parseInt(Cookies.get("userID"), 10);

  const [loading, setLoading] = useState(true);
  const [swtd, setSWTD] = useState(null);
  const [swtdProof, setSWTDProof] = useState(null);

  const [showModal, openModal, closeModal] = useSwitch();
  const [showProofModal, openProofModal, closeProofModal] = useSwitch();
  const [showEditProof, openEditProof, closeEditProof] = useSwitch();
  const [showDeleteModal, openDeleteModal, closeDeleteModal] = useSwitch();

  const [isEditing, enableEditing, cancelEditing] = useSwitch();
  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [showError, triggerShowError] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [selectedTerm, setSelectedTerm] = useState({
    start: "",
    end: "",
    ongoing: false,
  });
  const [terms, setTerms] = useState([]);
  const [termStatus, setTermStatus] = useState(false);
  const [status, setStatus] = useState({
    status: "",
    validated_on: "",
    validator: "",
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

  const setTerm = (term_id) => {
    if (!term_id) return "";
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
        setSWTD(data);
        const formattedDate = formatDate(data.date);
        setForm({
          title: data.title,
          venue: data.venue,
          category: data.category,
          term_id: data.term.id,
          role: data.role,
          date: formattedDate,
          time_started: data.time_started,
          time_finished: data.time_finished,
          points: data.points,
          benefits: data.benefits,
        });
        setTerm(data.term.id);
        fetchClearance(data.term.id);
        setLoading(false);
      },
      (error) => {
        console.log("Error fetching SWTD data: ", error);
        setLoading(false);
      }
    );
  };

  const fetchClearance = (term_id) => {
    getClearanceStatus(
      {
        id: id,
        term_id: term_id,
        token: token,
      },
      (response) => {
        setTermStatus(response.is_cleared);
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

  const fetchSWTDValidation = () => {
    getSWTDValidation(
      {
        form_id: swtd_id,
        token: token,
      },
      (response) => {
        setStatus(response.data);
      },
      (error) => {
        console.log("Error fetching SWTD data: ", error);
      }
    );
  };

  const fetchTerms = () => {
    getTerms(
      {
        token: token,
      },
      (response) => {
        setTerms(response.terms);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const truncateTitle = (title) => {
    if (title.length > 100) {
      return title.substring(0, 100) + "...";
    }
    return title;
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
      setTerm(selectedTermId);
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
      form.points === 0
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
        triggerShowSuccess(3000);
        cancelEditing();
        fetchSWTD();
        fetchSWTDValidation();
      },
      (error) => {
        if (error.response && error.response.data) {
          setErrorMessage(<>{error.message}</>);
          triggerShowError(3000);
          cancelEditing();
        } else {
          setErrorMessage(<>An error occurred.</>);
          triggerShowError(3000);
        }
      }
    );
  };

  const proofSuccess = async () => {
    triggerShowSuccess(3000);
    fetchSWTDProof();
    fetchSWTDValidation();
  };

  const proofError = (message) => {
    setErrorMessage(message);
    triggerShowError(3000);
  };

  const handleDeleteRecord = async () => {
    await deleteSWTD(
      {
        id: swtd_id,
        token: token,
      },
      (response) => {
        navigate("/swtd");
      },
      (error) => {
        console.log(error.message);
      }
    );
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
    fetchSWTD();
    fetchTerms();
    fetchSWTDValidation();
    if (swtd) setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <div className={styles.background}>
      <Container className="d-flex flex-column justify-content-start align-items-start">
        {/* View Proof Modal */}
        <Modal
          show={showProofModal}
          onHide={closeProofModal}
          size="lg"
          centered>
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

        {/* Header */}
        <Row className="w-100 mb-2">
          <Col>
            <h3 className={styles.label}>
              <i
                className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
                onClick={() => navigate("/swtd")}></i>{" "}
              Training Information
            </h3>
          </Col>
        </Row>

        {/* SWTD Information */}
        <Card className="mb-3 w-100">
          <Card.Header className={styles.cardHeader}>
            <Row>
              <Col>
                Status:{" "}
                <span
                  className={
                    status?.status === "PENDING"
                      ? "text-muted"
                      : status?.status === "APPROVED"
                      ? "text-success"
                      : status?.status === "REJECTED"
                      ? "text-danger"
                      : ""
                  }>
                  {status?.status}
                </span>
              </Col>
              {!termStatus && (
                <Col className="text-end">
                  {isEditing ? (
                    <BtnSecondary
                      onClick={() => {
                        cancelEditing();
                        fetchSWTD();
                      }}>
                      Cancel Editing
                    </BtnSecondary>
                  ) : (
                    <>
                      <BtnSecondary
                        onClick={() => {
                          fetchSWTD();
                          enableEditing();
                        }}>
                        Edit
                      </BtnSecondary>{" "}
                      <BtnPrimary onClick={openDeleteModal}>Delete</BtnPrimary>
                    </>
                  )}
                </Col>
              )}
              <ConfirmationModal
                show={showDeleteModal}
                onHide={closeDeleteModal}
                onConfirm={handleDeleteRecord}
                header={"Delete SWTD"}
                message={"Do you wish to delete this submission?"}
              />
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
                  {isEditing ? (
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
                  ) : (
                    <Col className="d-flex align-items-center">
                      {truncateTitle(swtd?.title)}
                    </Col>
                  )}
                </Form.Group>
              </Row>

              <Row className="w-100">
                {/* Venue */}
                <Col>
                  <Form.Group as={Row} className="mb-3" controlId="inputVenue">
                    <Form.Label className={styles.formLabel} column sm="2">
                      Venue
                    </Form.Label>
                    {isEditing ? (
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
                    ) : (
                      <Col className="d-flex align-items-center">
                        {swtd?.venue}
                      </Col>
                    )}
                  </Form.Group>
                </Col>

                {/* Category */}
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
                    ) : (
                      <Col className="d-flex align-items-center">
                        {swtd?.category}
                      </Col>
                    )}
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
                    {isEditing ? (
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
                    ) : (
                      <Col className="d-flex align-items-center">
                        {swtd?.term.name}
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
                    ) : (
                      <Col className="d-flex align-items-center">
                        {swtd?.role}
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
                            <>
                              Date must be valid and within the selected term.
                            </>
                          )}
                        </Form.Control.Feedback>
                      </Col>
                    ) : (
                      <Col className="d-flex align-items-center">
                        {swtd?.date}
                      </Col>
                    )}
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
                    {isEditing ? (
                      <>
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
                      </>
                    ) : (
                      <Col className="d-flex align-items-center" sm="10">
                        {swtd?.time_started} to {swtd?.time_finished}
                      </Col>
                    )}
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
                    {isEditing ? (
                      <>
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
                      </>
                    ) : (
                      <Col
                        className={`${styles.points} d-flex justify-content-start align-items-center`}
                        sm="2">
                        {swtd?.points}
                      </Col>
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
                  {isEditing ? (
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
                  ) : (
                    <Col
                      className="d-flex align-items-center w-100"
                      style={{ wordWrap: "break-word" }}>
                      {swtd?.benefits}
                    </Col>
                  )}
                </Form.Group>
              </Row>
              {isEditing && (
                <Row>
                  <Col className="text-end">
                    <BtnPrimary onClick={openModal} disabled={invalidFields()}>
                      Save Changes
                    </BtnPrimary>
                  </Col>
                </Row>
              )}
              <ConfirmationModal
                show={showModal}
                onHide={closeModal}
                onConfirm={handleSubmit}
                header={"Update Details"}
                message={"Do you wish to save these changes?"}
              />
            </Form>
          </Card.Body>
        </Card>

        {/* Comments */}
        {!isEditing && <Comments />}
      </Container>
    </div>
  );
};

export default EditSWTD;
