import React, { useState, useRef } from "react";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import { Modal, Row, Col, Form } from "react-bootstrap";

import { editProof } from "../../api/swtd";
import { useSwitch } from "../../hooks/useSwitch";

import ConfirmationModal from "./ConfirmationModal";
import BtnPrimary from "../buttons/BtnPrimary";
import styles from "./style.module.css";

const EditProofModal = ({ show, onHide, editSuccess, editError }) => {
  const { id } = useParams();
  const inputFile = useRef(null);
  const token = Cookies.get("userToken");
  const [proof, setProof] = useState(null);
  const [showModal, openModal, closeModal] = useSwitch();
  const [isProofInvalid, setIsProofInvalid] = useState(false);

  const handleProof = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (file && allowedTypes.includes(file.type)) {
      setProof(file);
      setIsProofInvalid(false);
    } else {
      inputFile.current.value = null;
      setIsProofInvalid(true);
    }
  };

  const updateProof = async () => {
    await editProof(
      {
        id: id,
        token: token,
        proof: proof,
      },
      (response) => {
        closeModal();
        onHide();
        editSuccess();
      },
      (error) => {
        console.log(error.response.data.msg);
        editError(error.response.data.msg);
      }
    );
  };

  return (
    <>
      <Modal size="md" show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Proof</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.comment}>
          <Form noValidate onSubmit={(e) => e.preventDefault()}>
            <Form.Group controlId="inputProof">
              <Form.Control
                type="file"
                name="proof"
                onChange={handleProof}
                ref={inputFile}
                isInvalid={isProofInvalid}
              />
              <Form.Text muted>Only upload PDFs, PNG, JPG/JPEG.</Form.Text>
            </Form.Group>
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
                disabled={isProofInvalid || !proof}>
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
