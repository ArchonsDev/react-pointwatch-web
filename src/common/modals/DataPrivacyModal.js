import React from "react";
import { Modal } from "react-bootstrap";

import styles from "./style.module.css";
const DataPrivacyModal = ({ show, onHide }) => {
  return (
    <>
      <Modal size="lg" show={show} onHide={onHide} scrollable centered>
        <Modal.Header closeButton>
          <Modal.Title className={styles.header}>
            Data Privacy Notice
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={`${styles.comment} p-4`}>
          <div className={`text-muted text-end mb-3`}>
            Last Updated: November 01, 2024
          </div>

          <div className="mb-3">
            The PointWatch team is committed to protecting the privacy of our
            users. This Data Privacy Notice explains how we collect, use, share,
            and secure personal information within our system and the rights you
            have in relation to this data. By using our services, you agree to
            the practices described in this notice.
          </div>

          <div className={styles.header}>Information We Collect</div>
          <div className="mb-3">
            We collect the following personal information during the
            registration process and throughout your use of the system:
            <ul>
              <li>Employee ID</li>
              <li>Name</li>
              <li>Department</li>
              <li>E-mail address</li>
              <li>Password</li>
            </ul>
          </div>

          <div className={styles.header}>How We Collect Your Data</div>
          <div className="mb-3">
            Data is collected directly from you when you register on this
            platform and it is used during your interactions with our system.
          </div>

          <div className={styles.header}>Purpose of Data Collection</div>
          <div className="mb-3">
            The personal information we collect is used primarily to:
            <ul>
              <li>
                Enhance and personalize the user experience within our system.
              </li>
              <li>
                Facilitate internal processes, including account verification
                and tracking of employee data within the system.
              </li>
            </ul>
          </div>

          <div className={styles.header}>Data Sharing and Disclosure</div>
          <div className="mb-3">
            We do not share or disclose your personal information to third
            parties under any circumstances, except as required by law or in
            response to valid requests by public authorities.
          </div>

          <div className={styles.header}>Data Retention</div>
          <div className="mb-3">
            Your personal information will be retained for as long as the system
            operates to ensure continuous service and access. Should the system
            discontinue, all personal data will be securely erased.
          </div>

          <div className={styles.header}>Security Measures</div>
          <div className="mb-3">
            We employ robust security measures to protect your personal
            information, including:
            <ul>
              <li>
                Password Encryption: Your password is stored in a hashed format
                to prevent unauthorized access.
              </li>
              <li>
                JWT Authentication: We use JSON Web Token (JWT) authentication
                to verify your identity securely during system access.
              </li>
            </ul>
          </div>

          <div className={styles.header}>Changes to This Privacy Notice</div>
          <div className="mb-3">
            We may update this privacy notice periodically to reflect changes in
            our practices, legal requirements, or enhancements to our system. We
            encourage you to review this notice regularly for any updates.
          </div>

          <div className={styles.header}>User Rights</div>
          <div className="mb-3">
            You have the following rights concerning your personal information:
            <ul>
              <li>
                Access: You can request a copy of the personal data we hold
                about you.
              </li>
              <li>
                Correction: You may request corrections to any inaccurate or
                outdated information.
              </li>
              <li>
                Deletion: You can request the deletion of your data under
                certain conditions.
              </li>
            </ul>
            To exercise any of these rights, please contact us using the
            information provided below.
          </div>

          <div className={styles.header}>Contact Information</div>
          <div>
            If you have questions or concerns about this Data Privacy Notice or
            wish to exercise your rights, please contact us at:{" "}
            <a href="mailto:hr@cit.edu">hr@cit.edu</a>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DataPrivacyModal;
