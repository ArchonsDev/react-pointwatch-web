import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Modal, Row, Col, Form } from "react-bootstrap";

import types from "../../data/types.json";
import { updateTerm } from "../../api/admin";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { formatDate } from "../format/date";
import { isEmpty } from "../validation/utils";

import ConfirmationModal from "./ConfirmationModal";
import BtnPrimary from "../buttons/BtnPrimary";
import styles from "./style.module.css";
const EditTermModal = ({ show, onHide, data, editSuccess }) => {
  const token = Cookies.get("userToken");
  const [showModal, openModal, closeModal] = useSwitch();
  const [showError, triggerShowError] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    type: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    if (data) {
      setForm({
        name: data.name || "",
        start_date: formatDate(data.start_date) || "",
        end_date: formatDate(data.end_date) || "",
        type: data.type || "",
      });
    }
  };

  const handleSubmit = () => {
    if (!isEmpty(form.start_date)) {
      const [year, month, day] = form.start_date.split("-");
      form.start_date = `${month}-${day}-${year}`;
    }

    if (!isEmpty(form.end_date)) {
      const [year, month, day] = form.end_date.split("-");
      form.end_date = `${month}-${day}-${year}`;
    }

    updateTerm(
      {
        ...form,
        id: data.id,
        token: token,
      },
      (response) => {
        editSuccess();
        closeModal();
        onHide();
      },
      (error) => {
        setErrorMessage(error.response.data);
        triggerShowError(4500);
      }
    );
  };

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || "",
        start_date: formatDate(data.start_date) || "",
        end_date: formatDate(data.end_date) || "",
        type: data.type || "",
      });
    }
  }, [data]);
  return (
    <>
      <Modal
        show={show}
        onHide={() => {
          onHide();
          resetForm();
        }}
        centered>
        <Modal.Header className={styles.header} closeButton>
          <Modal.Title>Edit Term</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showError && (
            <div
              className={`${styles.comment} alert alert-danger mb-3`}
              role="alert">
              {errorMessage}
            </div>
          )}
          <Form noValidate onSubmit={(e) => e.preventDefault()}>
            <Row>
              <Form.Group as={Row} className="mb-3" controlId="inputName">
                <Form.Label className={styles.message} column sm="2">
                  Name
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    className={styles.comment}
                    name="name"
                    onChange={handleChange}
                    value={form.name}
                  />
                </Col>
              </Form.Group>
            </Row>
            <Row>
              <Form.Group as={Row} className="mb-3" controlId="inputType">
                <Form.Label className={styles.message} column sm="2">
                  Type
                </Form.Label>
                <Col
                  className="d-flex justify-content-start align-items-center"
                  sm="10">
                  {types.type.map((item, index) => (
                    <Form.Check
                      key={index}
                      label={item}
                      value={item}
                      type="radio"
                      name="type"
                      checked={form.type === item}
                      className={styles.comment}
                      onChange={handleChange}
                      inline
                    />
                  ))}
                </Col>
              </Form.Group>
            </Row>
            <Row>
              <Form.Group as={Row} className="mb-3" controlId="inputStartDate">
                <Form.Label className={styles.message} column sm="2">
                  Start
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    type="date"
                    className={styles.comment}
                    name="start_date"
                    onChange={handleChange}
                    value={form.start_date}
                  />
                </Col>
              </Form.Group>
            </Row>
            <Row>
              <Form.Group as={Row} className="mb-3" controlId="inputEndDate">
                <Form.Label className={styles.message} column sm="2">
                  End
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    type="date"
                    min={form.start_date}
                    className={styles.comment}
                    name="end_date"
                    onChange={handleChange}
                    value={form.end_date}
                    isInvalid={form.end_date < form.start_date}
                  />
                  <Form.Control.Feedback type="invalid">
                    End date must be after the start date.
                  </Form.Control.Feedback>
                </Col>
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
        onConfirm={handleSubmit}
        header={"Update Term"}
        message={
          "Do you wish to save these changes? This will affect SWTD point calculations for this term."
        }
      />
    </>
  );
};

export default EditTermModal;
