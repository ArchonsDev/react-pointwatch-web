import React, { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { Container, Row, Col, Card, Modal, Spinner, Form } from "react-bootstrap"; /* prettier-ignore */
import { useNavigate, useParams } from "react-router-dom";

import Comments from "./Comments";
import EditSWTD from "./EditSWTD";
import { getClearanceStatus } from "../../api/user";
import { getSWTD, getSWTDProof, deleteSWTD } from "../../api/swtd";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { wordDate } from "../../common/format/date";
import { formatTime } from "../../common/format/time";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import EditProofModal from "../../common/modals/EditProofModal";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";

const SWTDDetails = () => {
  const { swtd_id } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get("userToken");
  const id = parseInt(Cookies.get("userID"), 10);
  const textareaRef = useRef(null);

  const [isEditing, enableEditing, cancelEditing] = useSwitch();
  const [showEditProof, openEditProof, closeEditProof] = useSwitch();
  const [showDeleteModal, openDeleteModal, closeDeleteModal] = useSwitch();
  const [showProofModal, openProofModal, closeProofModal] = useSwitch();
  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [showError, triggerShowError] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [swtd, setSWTD] = useState(null);
  const [swtdProof, setSWTDProof] = useState(null);
  const [termStatus, setTermStatus] = useState(true);

  const fetchSWTD = () => {
    getSWTD(
      {
        form_id: swtd_id,
        token: token,
      },
      (response) => {
        setSWTD(response.data);
        fetchClearance(response.data.term.id);
        setLoading(false);
      },
      (error) => {
        navigate("/swtd");
        setLoading(false);
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

  const fetchClearance = (term_id) => {
    getClearanceStatus(
      {
        id: id,
        term_id: term_id,
        token: token,
      },
      (response) => {
        setTermStatus(response.is_cleared);
      },
      (error) => {
        console.log("Error fetching clearance status: ", error);
      }
    );
  };

  const truncateTitle = (title) => {
    if (title?.length > 100) {
      return title.substring(0, 100) + "...";
    }
    return title;
  };

  const proofSuccess = async () => {
    triggerShowSuccess(3000);
    fetchSWTDProof();
    fetchSWTD();
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

  useEffect(() => {
    fetchSWTD();
    if (swtd) setLoading(false);
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [swtd?.benefits]);

  if (loading)
    return (
      <Row
        className={`${styles.loading} d-flex flex-column justify-content-center align-items-center w-100`}
        style={{ height: "100vh" }}>
        <Col></Col>
        <Col className="text-center">
          <div>
            <Spinner animation="border" />
          </div>
          Loading data...
        </Col>
        <Col></Col>
      </Row>
    );

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center">
      <Row className="w-100 mb-2">
        <Col>
          <h3 className={styles.label}>
            <i
              className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
              onClick={() => navigate("/swtd/all")}></i>{" "}
            SWTD Information
          </h3>
        </Col>

        {/* Edit/Delete & Cancel Buttons */}
        <Col lg="auto" md="auto" xs={12}>
          {isEditing ? (
            <BtnSecondary
              onClick={() => {
                fetchSWTD();
                cancelEditing();
              }}>
              Cancel Editing
            </BtnSecondary>
          ) : (
            <>
              {!termStatus && (
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
            </>
          )}
        </Col>
        <ConfirmationModal
          show={showDeleteModal}
          onHide={closeDeleteModal}
          onConfirm={handleDeleteRecord}
          header={"Delete SWTD"}
          message={"Do you wish to delete this submission?"}
        />
      </Row>

      <Card className="mb-3 w-100">
        <Card.Header className={styles.cardHeader}>
          <Row>
            {/* SWTD Status */}
            <Col>
              Status:{" "}
              <span
                className={
                  swtd?.validation.status === "PENDING"
                    ? "text-muted"
                    : swtd?.validation.status === "APPROVED"
                    ? "text-success"
                    : swtd?.validation.status === "REJECTED"
                    ? "text-danger"
                    : ""
                }>
                {swtd?.validation.status === "REJECTED"
                  ? "FOR REVISION"
                  : swtd?.validation.status}
              </span>
            </Col>

            {!isEditing && (
              <>
                <Col className={`text-end`}>
                  <span
                    className={
                      styles.pointsDisplay
                    }>{`${swtd?.points} POINTS`}</span>
                </Col>
              </>
            )}
          </Row>
        </Card.Header>

        <Card.Body className={`${styles.cardBody} p-4`}>
          {isEditing ? (
            <EditSWTD
              cancelEditing={cancelEditing}
              updateSWTD={fetchSWTD}
              updateSuccess={triggerShowSuccess}
            />
          ) : (
            <>
              {showError && (
                <div className="alert alert-danger mb-3" role="alert">
                  {errorMessage}
                </div>
              )}
              {showSuccess && (
                <div className="alert alert-success mb-3" role="alert">
                  SWTD Details updated.
                </div>
              )}

              <Row className="mb-lg-3 mb-2">
                <Col className={styles.formLabel} lg={2} md={2} xs={4}>
                  Title
                </Col>
                <Col>{truncateTitle(swtd?.title)}</Col>
              </Row>

              <Row>
                <Col
                  className={`${styles.formLabel} mb-lg-3 mb-2`}
                  lg={2}
                  md={2}
                  xs={4}>
                  Venue
                </Col>
                <Col className="mb-lg-3 mb-2" lg={4} md={4} xs={8}>
                  {swtd?.venue}
                </Col>
                <Col
                  className={`${styles.formLabel} mb-lg-3 mb-2`}
                  lg={2}
                  md={2}
                  xs={4}>
                  <span className={styles.formLabel}>Term</span>
                </Col>
                <Col>{swtd?.term.name}</Col>
              </Row>

              <Row>
                <Col
                  className={`${styles.formLabel} mb-lg-3 mb-2`}
                  lg={2}
                  md={2}
                  xs={4}>
                  Category
                </Col>
                <Col lg={4} md={4} xs={8}>
                  {swtd?.category}
                </Col>
                <Col
                  className={`${styles.formLabel} mb-lg-3 mb-2`}
                  lg={2}
                  md={2}
                  xs={4}>
                  Has deliverables
                </Col>
                <Col>
                  {swtd?.has_deliverables === true ? (
                    <>
                      <i className="fa-solid fa-circle-check text-success fa-lg me-2"></i>
                      Yes
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-circle-xmark text-danger fa-lg me-2"></i>
                      No
                    </>
                  )}
                </Col>
              </Row>

              <Row className="mb-lg-3 mb-2">
                <Col
                  className={`${styles.formLabel} mb-lg-3 mb-2`}
                  lg={2}
                  md={2}
                  xs={4}>
                  Date & Time
                </Col>
                <Col md="4">
                  {swtd?.dates?.map((entry, index) => (
                    <div key={index}>
                      {wordDate(entry.date)}
                      {!swtd?.category?.startsWith("Degree") && (
                        <>
                          {" "}
                          ({formatTime(entry.time_started)} to{" "}
                          {formatTime(entry.time_ended)})
                        </>
                      )}
                    </div>
                  ))}
                </Col>
                <Col className={styles.formLabel} md="2">
                  Proof
                </Col>
                <Col md="4">
                  <BtnPrimary
                    onClick={() => {
                      fetchSWTDProof();
                      openProofModal();
                    }}>
                    View
                  </BtnPrimary>{" "}
                  {!termStatus && (
                    <BtnSecondary onClick={() => openEditProof()}>
                      Change
                    </BtnSecondary>
                  )}
                </Col>
                <EditProofModal
                  show={showEditProof}
                  onHide={closeEditProof}
                  editSuccess={proofSuccess}
                  editError={proofError}
                />
              </Row>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className={styles.formLabel}>
                    Takeaways
                  </Form.Label>
                  <Col>
                    <Form.Control
                      as="textarea"
                      ref={textareaRef}
                      className={styles.formBox}
                      value={swtd?.benefits}
                      style={{ overflow: "hidden" }}
                      readOnly
                    />
                  </Col>
                </Form.Group>
              </Form>
            </>
          )}
        </Card.Body>
      </Card>
      <Modal show={showProofModal} onHide={closeProofModal} size="lg" centered>
        <Modal.Body className="d-flex justify-content-center align-items-center">
          <Row className="w-100">
            {!swtdProof ? (
              <div
                className={`${styles.msg} d-flex justify-content-center align-items-center`}>
                <Spinner className={`me-2`} animation="border" />
                Loading proof...
              </div>
            ) : (
              <>
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
              </>
            )}
          </Row>
        </Modal.Body>
      </Modal>
      {!isEditing && <Comments />}
    </Container>
  );
};
export default SWTDDetails;
