import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Container, Form, Row, Col, Card, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

import Comments from "./Comments";
import EditSWTD from "./EditSWTD";
import { getClearanceStatus } from "../../api/user";
import { getSWTD, getSWTDProof, deleteSWTD } from "../../api/swtd";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";

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

  if (loading) return null;

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
              <Row>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label className={styles.formLabel} column sm="1">
                    Title
                  </Form.Label>
                  <Col className="d-flex align-items-center">
                    {truncateTitle(swtd?.title)}
                  </Col>
                </Form.Group>
              </Row>
              <Row className="w-100">
                {/* Venue */}
                <Col>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label className={styles.formLabel} column sm="2">
                      Venue
                    </Form.Label>
                    <Col className="d-flex align-items-center">
                      {swtd?.venue}
                    </Col>
                  </Form.Group>
                </Col>
                {/* Category */}
                <Col>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label className={styles.formLabel} column sm="2">
                      Category
                    </Form.Label>
                    <Col className="d-flex align-items-center">
                      {swtd?.category}
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="w-100">
                {/* Term */}
                <Col>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label className={styles.formLabel} column sm="2">
                      Term
                    </Form.Label>
                    <Col className="d-flex align-items-center">
                      {swtd?.term.name}
                    </Col>
                  </Form.Group>
                </Col>
                {/* Role */}
                <Col>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label
                      className={`${styles.formLabel} text-end`}
                      column
                      sm="2">
                      Role
                    </Form.Label>
                    <Col className="d-flex align-items-center">
                      {swtd?.role}
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="w-100">
                {/* Date */}
                <Col>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label className={styles.formLabel} column sm="2">
                      Date
                    </Form.Label>
                    <Col className="d-flex align-items-center">
                      {swtd?.date}
                    </Col>
                  </Form.Group>
                </Col>
                {/* Time */}
                <Col>
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label
                      className={`${styles.formLabel} text-end`}
                      column
                      sm="2">
                      Time
                    </Form.Label>
                    <Col className="d-flex align-items-center">
                      {swtd?.time_started} to {swtd?.time_finished}
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="w-100">
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
                <Col className="text-end">
                  <Form.Group as={Row} className="mb-3">
                    <Form.Label className={styles.formLabel} column sm="2">
                      Points
                    </Form.Label>
                    <Col
                      className={`${styles.points} d-flex justify-content-start align-items-center`}
                      sm="2">
                      {swtd?.points}
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label className={styles.formLabel} column sm="1">
                    Benefits
                  </Form.Label>
                  <Col
                    className="d-flex align-items-center w-100"
                    style={{ wordWrap: "break-word" }}>
                    {swtd?.benefits}
                  </Col>
                </Form.Group>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>
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
      {!isEditing && <Comments />}
    </Container>
  );
};
export default SWTDDetails;
