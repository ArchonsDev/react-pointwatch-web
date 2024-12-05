import React from "react";
import { Modal } from "react-bootstrap";

import styles from "./style.module.css";
const DataPrivacyModal = ({ show, onHide }) => {
  return (
    <>
      <Modal size="lg" show={show} onHide={onHide} scrollable centered>
        <Modal.Header closeButton>
          <Modal.Title className={styles.header}>Privacy Notice</Modal.Title>
        </Modal.Header>
        <Modal.Body className={`${styles.comment} p-4`}>
          By accomplishing this form the following personal information will be
          collected: email, employee ID, full name, and department/office. This
          personal information will solely be used for purposes of this activity
          only. The information you provided in this form will be used within
          CIT University and will not be shared with any outside parties unless
          there is prior written consent from you. CIT University respects your
          rights as a data subject under the Data Privacy Act. If you have
          further questions and concerns regarding the processing of your
          personal information you are welcome to contact our Data Protection
          Officer via <a href="mailto:dpo@cit.edu">dpo@cit.edu</a>.
          <div className={`text-muted text-center mt-3`}>
            Last Updated: November 28, 2024
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DataPrivacyModal;
