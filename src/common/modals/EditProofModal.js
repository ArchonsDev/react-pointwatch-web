import React, { useState, useRef } from "react";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import { Modal, Row, Col, Form, FloatingLabel } from "react-bootstrap";

import { addProof } from "../../api/swtd";
import { useSwitch } from "../../hooks/useSwitch";

import ConfirmationModal from "./ConfirmationModal";
import BtnPrimary from "../buttons/BtnPrimary";
import styles from "./style.module.css";

const EditProofModal = ({ show, onHide, editSuccess, editError }) => {
  const { swtd_id } = useParams();
  const inputFile = useRef(null);
  const token = Cookies.get("userToken");
  const [files, setFiles] = useState(null);
  const [showModal, openModal, closeModal] = useSwitch();
  const [isProofInvalid, setIsProofInvalid] = useState(false);

  const handleProof = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    const validFiles = selectedFiles.filter((file) =>
      allowedTypes.includes(file.type)
    );
    if (validFiles.length > 0) {
      setFiles(validFiles);
      setIsProofInvalid(false);
    } else {
      inputFile.current.value = null;
      setIsProofInvalid(true);
    }
  };

  const updateProof = async () => {
    await addProof(
      {
        form_id: swtd_id,
        files: files,
        token: token,
      },
      (response) => {
        closeModal();
        onHide();
        editSuccess();
      },
      (error) => {
        console.log(error.response);
        editError(error.response);
        onHide();
      }
    );
  };

  return (
    <>
      <Modal size="md" show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title className={styles.header}>Add Proof</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.comment}>
          <Form noValidate onSubmit={(e) => e.preventDefault()}>
            <FloatingLabel
              controlId="floatingInputProof"
              label="Proof"
              className="mb-3">
              <Form.Control
                type="file"
                className={styles.formBox}
                name="files"
                onChange={handleProof}
                ref={inputFile}
                isInvalid={isProofInvalid}
                multiple
              />
              <Form.Text muted>PDFs, PNG, JPG/JPEG only (Max: 5MB).</Form.Text>
            </FloatingLabel>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Row className="w-100">
            <Col className="text-end">
              <BtnPrimary
                onClick={() => {
                  openModal();
                  onHide();
                }}
                disabled={isProofInvalid || !files}>
                Save
              </BtnPrimary>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>

      <ConfirmationModal
        show={showModal}
        onHide={closeModal}
        onConfirm={updateProof}
        header={"Update Proof"}
        message={"Do you wish to save these changes?"}
      />
    </>
  );
};

export default EditProofModal;
