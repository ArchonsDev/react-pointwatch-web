import React, { useState, useEffect, useContext, useRef } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Container, Card, Form, Button, Modal, Spinner } from "react-bootstrap"; /* prettier-ignore */

import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { validateSWTD } from "../../api/admin";
import { getSWTD, getProof } from "../../api/swtd"; /* prettier-ignore */
import { wordDate } from "../../common/format/date";
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
  const [loadingProof, setLoadingProof] = useState(true);
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
  const [currentProofIndex, setCurrentProofIndex] = useState(0);

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
        setSWTD(response.data.swtd_form);
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

  const fetchSWTDProof = (id) => {
    getProof(
      {
        form_id: swtd_id,
        proof_id: id,
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

        setLoadingProof(false);
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
        setIsProcessing(false);
        triggerShowSuccess(3000);
        fetchSWTD();
      },
      (error) => {
        setIsProcessing(false);
        setErrorMessage(error.response);
        triggerShowError(3000);
      }
    );
    setIsProcessing(false);
  };

  const handleCloseProofModal = () => {
    setCurrentProofIndex(0);
    closeProofModal();
  };

  const handleProofNavigation = (direction) => {
    const newIndex = currentProofIndex + direction;

    if (newIndex >= 0 && newIndex < swtd.proof.length) {
      setLoadingProof(true);
      setCurrentProofIndex(newIndex);
      fetchSWTDProof(swtd.proof[newIndex].id);
    }
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
    <Container className="d-flex flex-column justify-content-center align-items-center">
      {/* Proof Display */}
      <Modal
        show={showProofModal}
        onHide={handleCloseProofModal}
        size="xl"
        centered>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body className="d-flex justify-content-center align-items-center">
          {!swtdProof ? (
            <Row className="w-100">
              <div
                className={`${styles.msg} d-flex justify-content-center align-items-center`}>
                <Spinner className={`me-2`} animation="border" />
                Loading proof...
              </div>
            </Row>
          ) : (
            <Container>
              <Row className="d-flex justify-content-center flex-row w-100 mb-3">
                <Col></Col>
                <Col lg="auto" md="auto">
                  <i
                    className={`${styles.points} ${styles.triangle} fa-solid fa-square-caret-left fa-2xl`}
                    onClick={() => {
                      handleProofNavigation(-1);
                    }}></i>
                </Col>
                <Col className={styles.formLabel} lg="auto" md="auto">
                  {currentProofIndex + 1} / {swtd.proof?.length}
                </Col>
                <Col lg="auto" md="auto">
                  <i
                    className={`${styles.points} ${styles.triangle} fa-solid fa-square-caret-right fa-2xl`}
                    onClick={() => {
                      handleProofNavigation(1);
                    }}></i>
                </Col>
                <Col className="text-end"></Col>
              </Row>

              <Row className="d-flex justify-content-center align-items-center w-100 mb-3">
                <Col className="text-center">
                  {loadingProof ? (
                    <>
                      <Row className="w-100">
                        <div
                          className={`${styles.msg} d-flex justify-content-center align-items-center`}>
                          <Spinner className={`me-2`} animation="border" />
                          Loading proof...
                        </div>
                      </Row>
                    </>
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
                          height="600px"
                          title="SWTD Proof PDF"
                          aria-label="SWTD Proof PDF"></iframe>
                      )}
                    </>
                  )}
                </Col>
              </Row>
            </Container>
          )}
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
        <div
          className={`${styles.filterOption} alert alert-danger mb-3 w-100`}
          role="alert">
          {errorMessage}
        </div>
      )}

      {showSuccess && (
        <div
          className={`${styles.filterOption} alert alert-success mb-3 w-100`}
          role="alert">
          SWTD Submission validated.
        </div>
      )}

      {/* SWTD Information */}
      <Card className="mb-3 w-100">
        <Card.Header className={styles.cardHeader}>
          <Row>
            <Col lg={6} md={6} xs={7}>
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
            <Col className={`text-end`} lg={6} md={6} xs={5}>
              <span
                className={
                  styles.pointsDisplay
                }>{`${swtd?.points} POINTS`}</span>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className={`${styles.cardBody} p-4`}>
          <Row className="mb-lg-3 mb-2">
            <Col className={styles.formLabel} lg={2} md={2} xs={4}>
              Title
            </Col>
            <Col lg={4} md={10} xs={8}>
              {truncateTitle(swtd?.title)}
            </Col>
          </Row>

          <Row>
            <Col
              className={`${styles.formLabel} mb-lg-3 mb-2`}
              lg={2}
              md={2}
              xs={4}>
              Venue
            </Col>
            <Col lg={4} md={10} xs={8}>
              {swtd?.venue}
            </Col>

            <Col
              className={`${styles.formLabel} mb-lg-3 mb-2`}
              lg={2}
              md={2}
              xs={4}>
              Term
            </Col>
            <Col className="mb-lg-3 mb-2" lg={4} md={10} xs={8}>
              {swtd?.term.name}
            </Col>
          </Row>

          <Row>
            <Col
              className={`${styles.formLabel} mb-lg-3 mb-2`}
              lg={2}
              md={2}
              xs={4}>
              Category
            </Col>
            <Col className="mb-lg-3 mb-2" lg={4} md={10} xs={8}>
              {swtd?.category}
            </Col>

            <Col
              className={`${styles.formLabel} mb-lg-3 mb-2`}
              lg={2}
              md={2}
              xs={4}>
              Duration
            </Col>
            <Col className="mb-lg-3 mb-2" lg={4} md={10} xs={8}>
              {swtd?.start_date === swtd?.end_date ? (
                wordDate(swtd?.start_date)
              ) : (
                <>
                  {wordDate(swtd?.start_date)} to {wordDate(swtd?.end_date)}
                </>
              )}
              {!swtd?.category.startsWith("Degree") && (
                <> ({swtd?.total_hours} hours)</>
              )}
            </Col>
          </Row>

          <Row>
            <Col
              className={`${styles.formLabel} mb-lg-3 mb-2`}
              lg={2}
              md={2}
              xs={4}>
              Proof
            </Col>
            <Col className="mb-lg-3 mb-2" lg={4} md={4} xs={8}>
              {swtd?.proof && swtd?.proof.length > 0 ? (
                <BtnPrimary
                  onClick={() => {
                    fetchSWTDProof(swtd.proof[0].id);
                    openProofModal();
                  }}>
                  View
                </BtnPrimary>
              ) : (
                <span className="text-danger me-3">No file(s) attached.</span>
              )}
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
            <Row>
              <Col className="text-lg-end text-md-end text-center">
                <Button
                  className={`me-lg-3 me-md-3 me-2 mb-1 ${
                    isProcessing ? "disabled-approve-btn" : ""
                  }`}
                  variant="success"
                  onClick={() => {
                    setValidation("APPROVED");
                    openValidateModal();
                  }}
                  disabled={isProcessing}>
                  {isProcessing ? (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"></span>
                  ) : (
                    <i className="fa-solid fa-check me-2"></i>
                  )}
                  APPROVE
                </Button>
                <Button
                  className={
                    isProcessing ? "disabled-revision-btn mb-1" : "mb-1"
                  }
                  variant="danger"
                  onClick={() => {
                    setValidation("REJECTED");
                    openValidateModal();
                  }}
                  disabled={isProcessing}>
                  {isProcessing ? (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"></span>
                  ) : (
                    <i className="fa-solid fa-xmark me-2"></i>
                  )}
                  NEEDS REVISION
                </Button>
              </Col>
              <ConfirmationModal
                show={showValidateModal}
                onHide={() => {
                  closeValidateModal();
                }}
                onConfirm={() => {
                  handleValidate();
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
