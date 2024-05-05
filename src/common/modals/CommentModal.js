import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import { Modal, Row, Col, Form } from "react-bootstrap";

import { editComment } from "../../api/comments";
import { isEmpty } from "../validation/utils";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";

import ConfirmationModal from "./ConfirmationModal";
import BtnPrimary from "../buttons/BtnPrimary";
import styles from "./style.module.css";

const CommentModal = ({ show, onHide, data, editSuccess }) => {
  const { id } = useParams();
  const token = Cookies.get("userToken");
  const [showModal, openModal, closeModal] = useSwitch();
  const [errorMessage, setErrorMessage] = useState(null);
  const [showError, triggerShowError] = useTrigger(false);
  const [showSuccess, triggerShowSuccess] = useTrigger(false);

  const [comment, setComment] = useState({
    comment_id: null,
    message: "",
  });

  const handleChange = (e) => {
    setComment({
      ...comment,
      [e.target.name]: e.target.value,
    });
  };

  const updateComment = async () => {
    if (isEmpty(comment.message)) {
      setErrorMessage("Comment cannot be empty.");
      setComment("");
      triggerShowError(3000);
      return;
    }

    await editComment(
      {
        swtd_id: id,
        comment_id: comment.comment_id,
        token: token,
        message: comment.message,
      },
      (response) => {
        triggerShowSuccess(3000);
        editSuccess();
        closeModal();
        onHide();
      },
      (error) => {
        setErrorMessage(error.response.data);
        triggerShowError(3000);
      }
    );
  };

  useEffect(() => {
    if (data) {
      setComment({
        comment_id: data.id,
        message: data.message,
      });
    }
  }, [data]);

  return (
    <>
      <Modal size="md" show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showError && (
            <div className="alert alert-danger mb-3" role="alert">
              {errorMessage}
            </div>
          )}

          {showSuccess && (
            <div className="alert alert-success mb-3" role="alert">
              Comment edited!
            </div>
          )}
          <Form onSubmit={(e) => e.preventDefault()}>
            <Row className="w-100">
              <Form.Group controlId="inputMessage">
                <Form.Control
                  type="text"
                  name="message"
                  onChange={handleChange}
                  value={comment.message}
                  className={styles.comment}
                />
              </Form.Group>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Row className="w-100">
            <Col className="text-end">
              <BtnPrimary
                onClick={() => {
                  openModal();
                  onHide();
                }}>
                Save
              </BtnPrimary>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>

      <ConfirmationModal
        show={showModal}
        onHide={closeModal}
        onConfirm={updateComment}
        header={"Update Comment"}
        message={"Do you wish to save these changes?"}
      />
    </>
  );
};

export default CommentModal;
