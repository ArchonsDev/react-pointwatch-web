import React, { useState, useEffect, useContext, useRef } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Container, Card, Form, Button, Modal, Spinner } from "react-bootstrap"; /* prettier-ignore */

import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { validateSWTD } from "../../api/admin";
import { getSWTD, getProof } from "../../api/swtd"; /* prettier-ignore */
import { wordDate } from "../../common/format/date";
import { formatTime } from "../../common/format/time";
import Comments from "../employee dashboard/Comments";
import SessionUserContext from "../../contexts/SessionUserContext";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";

const ViewSWTD = () => {
  const { user } = useContext(SessionUserContext);
  const { id, swtd_id } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get("userToken");

  const textareaRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [swtd, setSWTD] = useState(null);
  const [swtdProof, setSWTDProof] = useState(null);

  const [validation, setValidation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [showValidateModal, openValidateModal, closeValidateModal] =
    useSwitch();

  const [showProofModal, openProofModal, closeProofModal] = useSwitch();

  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [showError, triggerShowError] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleBack = () => {
    const previousUrl = `/dashboard/${id}`;
    navigate(previousUrl);
  };

  const fetchSWTD = () => {
    getSWTD(
      {
        token: token,
        form_id: swtd_id,
      },
      (response) => {
        setSWTD(response.data.data);
        setLoading(false);
      },
      (error) => {
        console.log("Error fetching SWTD data: ", error);
      }
    );
  };

  const truncateTitle = (title) => {
    if (title?.length > 100) {
      return title.substring(0, 100) + "...";
    }
    return title;
  };

  const fetchSWTDProof = () => {
    getProof(
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

  const handleValidate = async () => {
    setIsProcessing(true);
    await validateSWTD(
      {
        id: swtd_id,
        validator_id: user?.id,
        validation_status: validation,
        token: token,
      },
      (response) => {
        triggerShowSuccess(3000);
        fetchSWTD();
      },
      (error) => {
        setErrorMessage(error.response);
        triggerShowError(3000);
      }
    );
    setIsProcessing(false);
  };

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      if (!user?.is_head && !user?.is_staff && !user?.is_superuser)
        navigate("/swtd");
      else {
        fetchSWTD();
      }
    }
  }, [user, navigate]);

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
        className={`${styles.msg} d-flex flex-column justify-content-center align-items-center w-100`}
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
    <Container className="d-flex flex-column justify-content-start align-items-start">
      {/* Proof Display */}
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

      <Row className="w-100 mb-2">
        <Col>
          <h3 className={styles.label}>
            <i
              className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
              onClick={handleBack}></i>{" "}
            SWTD Information
          </h3>
        </Col>
      </Row>

      {showError && (
        <div className="alert alert-danger mb-3 w-100" role="alert">
          {errorMessage}
        </div>
      )}
      {showSuccess && (
        <div className="alert alert-success mb-3 w-100" role="alert">
          SWTD Submission validated.
        </div>
      )}

      {/* SWTD Information */}
      <Card className="mb-3 w-100">
        <Card.Header className={styles.cardHeader}>
          <Row>
            <Col>
              Status:{" "}
              <span
                className={
                  swtd?.validation_status === "PENDING"
                    ? "text-muted"
                    : swtd?.validation_status === "APPROVED"
                    ? "text-success"
                    : swtd?.validation_status === "REJECTED"
                    ? "text-danger"
                    : ""
                }>
                {swtd?.validation_status === "REJECTED"
                  ? "FOR REVISION"
                  : swtd?.validation_status}
              </span>
            </Col>
            <Col className={`text-end`}>
              <span
                className={
                  styles.pointsDisplay
                }>{`${swtd?.points} POINTS`}</span>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className={`${styles.cardBody} p-4`}>
          <Row className="mb-4">
            <Col className={styles.formLabel} md="2">
              Title
            </Col>
            <Col>{truncateTitle(swtd?.title)}</Col>
          </Row>

          <Row className="mb-4">
            <Col className={styles.formLabel} md="2">
              Venue
            </Col>
            <Col md="4">{swtd?.venue}</Col>
            <Col md="2">
              <span className={styles.formLabel}>Term</span>
            </Col>
            <Col>{swtd?.term.name}</Col>
          </Row>

          <Row className="mb-4">
            <Col className={styles.formLabel} md="2">
              Category
            </Col>
            <Col md="4">{swtd?.category}</Col>
            <Col className={styles.formLabel} md="2">
              Has deliverables
            </Col>
            <Col md="4">
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

          <Row className="mb-4">
            <Col className={styles.formLabel} md="2">
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
            </Col>
          </Row>

          <Form>
            <Form.Group className="mb-3">
              <Form.Label className={styles.formLabel}>Takeaways</Form.Label>
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
          {/* Validation Buttons */}
          {swtd?.validation_status === "PENDING" && (
            <Row className="w-100">
              <Col className="p-0 text-end">
                <Button
                  className={`me-3 ${
                    isProcessing ? "disabled-approve-btn" : ""
                  }`}
                  variant="success"
                  onClick={() => {
                    setValidation("APPROVED");
                    openValidateModal();
                    setIsProcessing(true); // Start processing
                  }}
                  disabled={isProcessing} // Disable while processing
                >
                  {isProcessing ? (
                    <span
                      className="spinner-border spinner-border-sm m-1"
                      role="status"
                      aria-hidden="true"></span>
                  ) : (
                    <i className="fa-solid fa-check m-1"></i>
                  )}
                  APPROVE
                </Button>
                <Button
                  className={isProcessing ? "disabled-revision-btn" : ""}
                  variant="danger"
                  onClick={() => {
                    setValidation("REJECTED");
                    openValidateModal();
                    setIsProcessing(true); // Start processing
                  }}
                  disabled={isProcessing} // Disable while processing
                >
                  {isProcessing ? (
                    <span
                      className="spinner-border spinner-border-sm m-1"
                      role="status"
                      aria-hidden="true"></span>
                  ) : (
                    <i className="fa-solid fa-xmark m-1"></i>
                  )}
                  NEEDS REVISION
                </Button>
              </Col>
              <ConfirmationModal
                show={showValidateModal}
                onHide={() => {
                  closeValidateModal();
                  setIsProcessing(false); // Reset when modal is closed
                }}
                onConfirm={() => {
                  handleValidate();
                  setIsProcessing(false); // Stop processing after validation
                }}
                header={"Validate SWTD"}
                message={
                  validation === "APPROVED"
                    ? "Do you wish to approve this form?"
                    : validation === "REJECTED"
                    ? "Would you like to send this form back for revision?"
                    : "Do you wish to make this change?"
                }
              />
            </Row>
          )}
        </Card.Body>
      </Card>
      <Comments />
    </Container>
  );
};

export default ViewSWTD;
