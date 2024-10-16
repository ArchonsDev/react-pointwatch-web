import React, { useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import { Card, Row, Col, Badge, ListGroup, Form, Button } from "react-bootstrap"; /* prettier-ignore */

import { isEmpty } from "../../common/validation/utils";
import { formatDateTime } from "../../common/format/time";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { getComments, postComment, deleteComment } from "../../api/comments"; /* prettier-ignore */
import SessionUserContext from "../../contexts/SessionUserContext";

import EditCommentModal from "../../common/modals/EditCommentModal";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";

const Comments = () => {
  const { user } = useContext(SessionUserContext);
  const { swtd_id } = useParams();
  const token = Cookies.get("userToken");
  const userID = parseInt(Cookies.get("userID"), 10);

  const [comment, setComment] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [comments, setComments] = useState([]);

  const [showModal, openModal, closeModal] = useSwitch();
  const [showCommentModal, openCommentModal, closeCommentModal] = useSwitch();

  const [showCommentError, triggerShowCommentError] = useTrigger(false);
  const [showCommentSuccess, triggerShowCommentSuccess] = useTrigger(false);

  const [errorMessage, setErrorMessage] = useState(null);

  const hasPermissions = () => {
    return user?.is_head || user?.is_staff || user?.is_superuser;
  };

  const fetchComments = () => {
    getComments(
      {
        id: swtd_id,
        token: token,
      },
      (response) => {
        setComments(response.data.data);
      },
      (error) => {
        console.log("Error: ", error.message);
      }
    );
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
        setErrorMessage(error.message);
        triggerShowCommentError(3000);
      }
    );
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
        console.log("Error: ", error.message);
      }
    );
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const editSuccess = async () => {
    triggerShowCommentSuccess(3000);
    await fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, []);
  return (
    <Card className="mb-3 w-100">
      <Card.Header className={styles.cardHeader}>Comments</Card.Header>
      {comments?.length !== 0 ? (
        <Card.Body
          className={`${styles.cardBody} d-flex justify-content-center align-items center p-1`}>
          <Row className="w-100">
            {showCommentError && (
              <div className="alert alert-danger mb-3" role="alert">
                {errorMessage}
              </div>
            )}

            {showCommentSuccess && (
              <div className="alert alert-success mb-3" role="alert">
                Comment edited successfully.
              </div>
            )}
            <ListGroup variant="flush">
              {comments &&
                comments.map((item) => (
                  <ListGroup.Item key={item.id} className={styles.commentBox}>
                    <Row>
                      <Col className={styles.formLabel} lg={2}>
                        {item.author.firstname} {item.author.lastname}
                      </Col>
                      <Col className="text-wrap" lg={5}>
                        {item.message}
                      </Col>
                      <Col className="text-end" lg={3}>
                        {formatDateTime(item.date_modified)}
                      </Col>
                      {item.is_edited ? (
                        <Col lg={1}>
                          <Badge bg="secondary" pill>
                            Edited
                          </Badge>
                        </Col>
                      ) : (
                        <Col lg={1}></Col>
                      )}
                      <Col className="text-end" lg={1}>
                        {item.author.id === userID && (
                          <i
                            className={`${styles.commentEdit} fa-solid fa-pen-to-square fa-lg me-3`}
                            onClick={() => {
                              openCommentModal();
                              setSelectedComment(item);
                            }}></i>
                        )}

                        {(item.author.id === userID || hasPermissions()) && (
                          <i
                            className={`${styles.commentDelete} fa-solid fa-trash-can fa-lg`}
                            onClick={() => {
                              openModal();
                              setSelectedComment(item);
                            }}></i>
                        )}
                      </Col>
                    </Row>
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
                  className={`${styles.formBox} ${styles.cardBody}`}
                  name="comment"
                  onChange={handleCommentChange}
                  value={comment}
                />
              </Form.Group>
            </Col>
            <Col className="text-end" sm="1">
              <Button className={`${styles.button} w-100`} onClick={handlePost}>
                <i className="fa-solid fa-paper-plane fa-lg"></i>
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Footer>
    </Card>
  );
};

export default Comments;
