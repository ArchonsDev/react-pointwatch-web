import React from "react";
import { useNavigate } from "react-router-dom";

import { Modal } from "react-bootstrap";

// CSS
import styles from "./styles.module.css";

// Custom Components
import BtnPrimary from "../../common/buttons/BtnPrimary";

export const DepartmentRequiredModal = ({ show, onHide }) => {
  const navigate = useNavigate();
  
  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title className={styles.header}>
          Missing Required Fields
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        className={`${styles.body} d-flex justify-content-center align-items-center`}>
        Department is required before adding a new record. Please proceed to
        your settings to make this change.
      </Modal.Body>
      <Modal.Footer>
        <BtnPrimary onClick={() => navigate("/settings")}>
          Go to Settings
        </BtnPrimary>
      </Modal.Footer>
    </Modal>
  );
}

export default DepartmentRequiredModal;