import React, { useEffect, useState, useRef, useContext } from "react";
import Cookies from "js-cookie";
import { Container, Row, Col, Card, Modal, Spinner, Form } from "react-bootstrap"; /* prettier-ignore */
import { useNavigate, useParams } from "react-router-dom";

import Comments from "./Comments";
import EditSWTD from "./EditSWTD";
import { getSWTD, deleteSWTD, getProof, deleteProof } from "../../api/swtd"; /* prettier-ignore */
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { wordDate } from "../../common/format/date";
import SessionUserContext from "../../contexts/SessionUserContext";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import EditProofModal from "../../common/modals/EditProofModal";
import styles from "./style.module.css";

const SWTDDetails = () => {
  const { user } = useContext(SessionUserContext);
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
  const [loadingProof, setLoadingProof] = useState(true);
  const [swtd, setSWTD] = useState(null);
  const [swtdProof, setSWTDProof] = useState(null);

  const [termClearance, setTermClearance] = useState(false);
  const [currentProofIndex, setCurrentProofIndex] = useState(0);

  const fetchSWTD = () => {
    getSWTD(
      {
        form_id: swtd_id,
        token: token,
      },
      (response) => {
        const data = response.data.swtd_form;
        const status = user?.clearances?.find(
          (clearance) => clearance.term.id === data.term.id
        );
        if (status) setTermClearance(status?.is_deleted ? false : true);
        else setTermClearance(false);
        setSWTD(data);
        setLoading(false);
      },
      (error) => {
        navigate("/swtd");
        setLoading(false);
      }
    );
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
          id: id,
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

  const handleDeleteRecord = async () => {
    await deleteSWTD(
      {
        id: swtd_id,
        token: token,
      },
      (response) => {
        navigate("/swtd/all");
      },
      (error) => {
        console.log(error.message);
        setErrorMessage(error.message);
        triggerShowError(3000);
      }
    );
  };

  const handleProofNavigation = (direction) => {
    const newIndex = currentProofIndex + direction;

    if (newIndex >= 0 && newIndex < swtd.proof.length) {
      setLoadingProof(true);
      setCurrentProofIndex(newIndex);
      fetchSWTDProof(swtd.proof[newIndex].id);
    }
  };

  const handleCloseProofModal = () => {
    setCurrentProofIndex(0);
    closeProofModal();
  };

  const handleDeleteProof = async () => {
    await deleteProof(
      {
        form_id: swtd_id,
        proof_id: swtdProof?.id,
        token: token,
      },
      (response) => {
        setCurrentProofIndex(0);
        triggerShowSuccess(3000);
        handleCloseProofModal();
        fetchSWTD();
      },
      (error) => {
        fetchSWTD();
        closeProofModal();
        setErrorMessage(error.message);
        triggerShowError(3000);
      }
    );
  };

  const truncateTitle = (title) => {
    if (title?.length > 100) {
      return title.substring(0, 100) + "...";
    }
    return title;
  };

  const updateProofSuccess = async () => {
    setCurrentProofIndex(0);
    triggerShowSuccess(3000);
    fetchSWTD();
  };

  const updateProofError = (message) => {
    setErrorMessage(message);
    triggerShowError(3000);
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
              {!termClearance && (
                <>
                  <BtnPrimary
                    onClick={() => {
                      fetchSWTD();
                      enableEditing();
                    }}>
                    Edit
                  </BtnPrimary>{" "}
                  <BtnSecondary onClick={openDeleteModal}>Delete</BtnSecondary>
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
                  Duration
                </Col>
                <Col lg={4} md={4} xs={8}>
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

              <Row className="mb-lg-3 mb-2">
                <Col className={styles.formLabel} md="2">
                  Proof
                </Col>
                <Col md="4">
                  {swtd?.proof && swtd?.proof.length > 0 ? (
                    <BtnPrimary
                      onClick={() => {
                        fetchSWTDProof(swtd.proof[0].id);
                        openProofModal();
                      }}>
                      View
                    </BtnPrimary>
                  ) : (
                    <>
                      <span className="text-danger me-3">
                        No file(s) attached.
                      </span>
                      <BtnPrimary
                        onClick={() => {
                          openEditProof();
                        }}>
                        <i className="fa-solid fa-circle-plus me-2"></i>Add
                      </BtnPrimary>
                    </>
                  )}
                </Col>
              </Row>

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
            </>
          )}
        </Card.Body>
      </Card>
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
                <Col>
                  <BtnPrimary
                    onClick={() => {
                      openEditProof();
                      closeProofModal();
                    }}>
                    <i className="fa-solid fa-circle-plus me-2"></i>Add
                  </BtnPrimary>
                </Col>
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
                <Col className="text-end">
                  <BtnSecondary
                    onClick={() => {
                      handleDeleteProof();
                    }}>
                    <i className="fa-solid fa-trash-can me-2"></i>Delete
                  </BtnSecondary>
                </Col>
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
      <EditProofModal
        show={showEditProof}
        onHide={closeEditProof}
        editSuccess={updateProofSuccess}
        editError={updateProofError}
      />
      {!isEditing && <Comments />}
    </Container>
  );
};
export default SWTDDetails;
