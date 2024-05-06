import React, { useState, useRef } from "react";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import { Modal, Row, Col, Form } from "react-bootstrap";

import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";

import ConfirmationModal from "./ConfirmationModal";
import BtnPrimary from "../buttons/BtnPrimary";
import styles from "./style.module.css";

const EditProofModal = ({ show, onHide, data, editSuccess, editError }) => {
  const { id } = useParams();
  const inputFile = useRef(null);
  const token = Cookies.get("userToken");
  const [isProofInvalid, setIsProofInvalid] = useState(false);
  const [showModal, openModal, closeModal] = useSwitch();

  const handleProof = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (file && allowedTypes.includes(file.type)) {
      // setForm({
      //   ...form,
      //   proof: file,
      // });
      setIsProofInvalid(false);
    } else {
      inputFile.current.value = null;
      setIsProofInvalid(true);
    }
  };

  const updateProof = () => {};

  return (
    <>
      <Modal size="md" show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate onSubmit={(e) => e.preventDefault()}>
            <Row className="w-100">
              <Form.Group controlId="inputProof">
                <Form.Control type="text" name="message" />
                <Form.Control.Feedback type="invalid">
                  Comment cannot be empty.
                </Form.Control.Feedback>
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
        onConfirm={updateProof}
        header={"Update Comment"}
        message={"Do you wish to save these changes?"}
      />
    </>
  );
};

export default EditProofModal;
