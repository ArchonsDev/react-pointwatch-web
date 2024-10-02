import React, { useState, useEffect, useContext, useRef } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Container, Card, Form, Button, ListGroup, Badge, Modal, Spinner } from "react-bootstrap"; /* prettier-ignore */

import { isEmpty } from "../../common/validation/utils";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { validateSWTD } from "../../api/admin";
import { getSWTD, getSWTDProof, getSWTDValidation } from "../../api/swtd"; /* prettier-ignore */
import { getComments, postComment, deleteComment } from "../../api/comments"; /* prettier-ignore */
import { wordDate } from "../../common/format/date";
import { formatTime } from "../../common/format/time";
import SessionUserContext from "../../contexts/SessionUserContext";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import EditCommentModal from "../../common/modals/EditCommentModal";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";

const ViewSWTD = () => {
  const { user } = useContext(SessionUserContext);
  const { id, swtd_id } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get("userToken");
  const userID = parseInt(Cookies.get("userID"), 10);
  const textareaRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [swtd, setSWTD] = useState(null);
  const [swtdProof, setSWTDProof] = useState(null);

  const [validation, setValidation] = useState("");
  const [swtdStatus, setSWTDStatus] = useState({
    status: "",
    validated_on: "",
    validator: "",
  });

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const [selectedComment, setSelectedComment] = useState(null);
  const [showModal, openModal, closeModal] = useSwitch();
  const [showValidateModal, openValidateModal, closeValidateModal] =
    useSwitch();

  const [showCommentModal, openCommentModal, closeCommentModal] = useSwitch();
  const [showProofModal, openProofModal, closeProofModal] = useSwitch();

  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [showError, triggerShowError] = useTrigger(false);
  const [showCommentError, triggerShowCommentError] = useTrigger(false);
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
        setSWTD(response.data);
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
        setSWTDStatus(response.data);
        setLoading(false);
      },
      (error) => {
        console.log("Error fetching SWTD data: ", error);
      }
    );
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handlePost = async (e) => {
    e.preventDefault();

    if (isEmpty(comment)) {
      setErrorMessage("Comment cannot be empty.");
      setComment("");
      triggerShowCommentError(3000);
      return;
    }

    postComment(
      {
        id: swtd_id,
        token: token,
        message: comment,
      },
      (response) => {
        fetchComments();
        setComment("");
      },
      (error) => {
        console.log("Error: ", error);
      }
    );
  };

  const fetchComments = () => {
    getComments(
      {
        id: swtd_id,
        token: token,
      },
      (response) => {
        setComments(response.data.comments);
      },
      (error) => {
        console.log("Error: ", error);
      }
    );
  };

  const editSuccess = async () => {
    await fetchComments();
  };

  const handleDelete = async () => {
    await deleteComment(
      {
        swtd_id: swtd_id,
        comment_id: selectedComment.id,
        token: token,
      },
      (response) => {
        fetchComments();
      },
      (error) => {
        console.log("Error: ", error);
      }
    );
  };

  const handleValidate = async () => {
    await validateSWTD(
      {
        id: swtd_id,
        response: validation,
        token: token,
      },
      (response) => {
        fetchSWTDValidation();
        triggerShowSuccess(3000);
      },
      (error) => {
        setErrorMessage(error.response);
        triggerShowError(3000);
      }
    );
  };

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      if (!user?.is_admin && !user?.is_staff && !user?.is_superuser)
        navigate("/swtd");
      else {
        fetchSWTD();
        fetchSWTDValidation();
        fetchComments();
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
        className={`${styles.msg} d-flex justify-content-center align-items-center w-100`}>
        <Spinner className={`me-2`} animation="border" />
        Loading data...
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
                  swtdStatus?.status === "PENDING"
                    ? "text-muted"
                    : swtdStatus?.status === "APPROVED"
                    ? "text-success"
                    : swtdStatus?.status === "REJECTED"
                    ? "text-danger"
                    : ""
                }>
                {swtdStatus?.status}
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
            <Col md="2">
              <span className={styles.formLabel}>Role</span>
            </Col>
            <Col>{swtd?.role}</Col>
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
          {swtdStatus?.status === "PENDING" && (
            <Row className="w-100">
              <Col className="p-0 text-end">
                <Button
                  className="me-3"
                  variant="success"
                  onClick={() => {
                    setValidation("APPROVED");
                    openValidateModal();
                  }}>
                  <i className="fa-solid fa-check"></i> APPROVE
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setValidation("REJECTED");
                    openValidateModal();
                  }}>
                  <i className="fa-solid fa-xmark"></i> NEEDS REVISION
                </Button>
              </Col>
              <ConfirmationModal
                show={showValidateModal}
                onHide={closeValidateModal}
                onConfirm={handleValidate}
                header={"Validate SWTD"}
                message={
                  validation === "APPROVED"
                    ? "Do you wish to approve this form?"
                    : validation === "REJECTED"
                    ? "Do you wish to reject this form?"
                    : "Do you wish to make this change?"
                }
              />
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Comments */}
      <Card className="mb-3 w-100">
        <Card.Header className={styles.cardHeader}>Comments</Card.Header>
        {comments.length !== 0 ? (
          <Card.Body
            className={`${styles.cardBody} d-flex justify-content-center align-items center p-1`}>
            {showCommentError && (
              <div className="alert alert-danger mb-3" role="alert">
                {errorMessage}
              </div>
            )}

            <Row className="w-100">
              <ListGroup variant="flush">
                {comments &&
                  comments.map((item) => (
                    <ListGroup.Item key={item.id} className={styles.commentBox}>
                      <Row>
                        <Col xs={2}>
                          {item.author.firstname} {item.author.lastname}
                        </Col>
                        <Col xs={6}>{item.message}</Col>
                        <Col xs={2}>{item.date_modified}</Col>
                        <Col className="text-end" xs={1}>
                          {item.author.id === userID && (
                            <i
                              className={`${styles.commentEdit} fa-solid fa-pen-to-square`}
                              onClick={() => {
                                openCommentModal();
                                setSelectedComment(item);
                              }}></i>
                          )}
                        </Col>
                        <Col className="text-end" xs={1}>
                          <i
                            className={`${styles.commentDelete} fa-solid fa-trash-can`}
                            onClick={() => {
                              openModal();
                              setSelectedComment(item);
                            }}></i>
                        </Col>
                      </Row>
                      {item.is_edited && (
                        <Badge bg="secondary" pill>
                          Edited
                        </Badge>
                      )}
                    </ListGroup.Item>
                  ))}
                <EditCommentModal
                  show={showCommentModal}
                  onHide={closeCommentModal}
                  data={selectedComment}
                  editSuccess={editSuccess}
                />
                <ConfirmationModal
                  show={showModal}
                  onHide={closeModal}
                  onConfirm={handleDelete}
                  header={"Delete Comment"}
                  message={"Do you wish to delete this comment?"}
                />
              </ListGroup>
            </Row>
          </Card.Body>
        ) : (
          <Card.Subtitle
            className={`${styles.comment} d-flex justify-content-center align-items center p-4 text-muted`}>
            No comments yet.
          </Card.Subtitle>
        )}

        <Card.Footer className="p-3">
          <Form noValidate onSubmit={(e) => e.preventDefault()}>
            <Row className="w-100">
              <Col sm="11">
                <Form.Group>
                  <Form.Control
                    type="text"
                    className={styles.formBox}
                    name="comment"
                    onChange={handleCommentChange}
                    value={comment}
                  />
                </Form.Group>
              </Col>
              <Col className="text-end" sm="1">
                <Button
                  className={`${styles.button} w-100`}
                  onClick={handlePost}>
                  <i className="fa-solid fa-paper-plane fa-lg"></i>
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default ViewSWTD;
