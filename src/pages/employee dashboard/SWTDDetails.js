import React, { useEffect, useState } from "react";
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

  if (loading)
    return (
      <Row
        className={`${styles.loading} d-flex justify-content-center align-items-center w-100`}>
        <Spinner className={`${styles.spinner} me-2`} animation="border" />
        Loading data...
      </Row>
    );

  return (
    <Container className="d-flex flex-column justify-content-start align-items-start">
      <Row className="w-100 mb-2">
        <Col>
          <h3 className={styles.label}>
            <i
              className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
              onClick={() => navigate("/swtd")}></i>{" "}
            Training Information
          </h3>
        </Col>

        {/* Edit/Delete & Cancel Buttons */}
        <Col className="text-end">
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
              <BtnSecondary
                onClick={() => {
                  fetchSWTD();
                  enableEditing();
                }}
                disabled={termStatus === true}>
                Edit
              </BtnSecondary>{" "}
              <BtnPrimary
                onClick={openDeleteModal}
                disabled={termStatus === true}>
                Delete
              </BtnPrimary>
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
                {swtd?.validation.status}
              </span>
            </Col>

            {!isEditing && (
              <Col className={`text-end`}>
                <span
                  className={
                    styles.pointsDisplay
                  }>{`${swtd.points} POINTS`}</span>
              </Col>
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

              <Row className="mb-4">
                <Col className={styles.formLabel} md="1">
                  Title
                </Col>
                <Col>{truncateTitle(swtd?.title)}</Col>
              </Row>

              <Row className="mb-4">
                <Col className={styles.formLabel} md="1">
                  Venue
                </Col>
                <Col md="5">{swtd?.venue}</Col>
              </Row>

              <Row className="mb-4">
                <Col md="1">
                  <span className={styles.formLabel}>Term</span>
                </Col>
                <Col>{swtd?.term.name}</Col>
              </Row>

              <Row className="mb-4">
                <Col className={styles.formLabel} md="1">
                  Category
                </Col>
                <Col>{swtd?.category}</Col>
              </Row>

              <Row className="mb-4">
                <Col md="1">
                  <span className={styles.formLabel}>Role</span>
                </Col>
                <Col>{swtd?.role}</Col>
              </Row>

              <Row className="mb-4">
                <Col className={styles.formLabel} md="1">
                  Date
                </Col>
                <Col>{wordDate(swtd?.date)}</Col>
              </Row>

              <Row className="mb-4">
                <Col className={styles.formLabel} md="1">
                  Time
                </Col>
                <Col>
                  {formatTime(swtd?.time_started)} to{" "}
                  {formatTime(swtd?.time_finished)}
                </Col>
              </Row>

              <Row className="mb-4">
                <Col className={styles.formLabel} md="1">
                  Proof
                </Col>
                <Col md="5">
                  <BtnPrimary
                    onClick={() => {
                      fetchSWTDProof();
                      openProofModal();
                    }}>
                    View
                  </BtnPrimary>{" "}
                  <BtnSecondary
                    onClick={() => openEditProof()}
                    disabled={termStatus === true}>
                    Change
                  </BtnSecondary>
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
                      className={styles.formBox}
                      value={swtd?.benefits}
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
