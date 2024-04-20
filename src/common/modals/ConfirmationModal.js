import React from "react";
import { Modal } from "react-bootstrap";

import BtnPrimary from "../buttons/BtnPrimary";
import BtnSecondary from "../buttons/BtnSecondary";

import styles from "./style.module.css";

const ConfirmationModal = ({
  show,
  onHide,
  onConfirm,
  header = null,
  message = null,
  size = "sm",
}) => {
  const handleConfirm = () => {
    onConfirm();
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size={size}
      aria-labelledby="contained-modal-title-vcenter"
      centered>
      <Modal.Header className={styles.header} closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {header ? header : "Confirm Delete"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.message}>
        <p>
          {message
            ? message
            : "Do you want to delete this item? (It will be gone forever!)"}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <div className="container-fluid d-flex justify-content-between">
          <BtnSecondary onClick={onHide}>No</BtnSecondary>
          <BtnPrimary onClick={handleConfirm}>Yes</BtnPrimary>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
