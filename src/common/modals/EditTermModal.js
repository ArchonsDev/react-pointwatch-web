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
      const dateObj = new Date(form.end_date);
      dateObj.setDate(dateObj.getDate() + 1);
      const [year, month, day] = dateObj.toISOString().split("T")[0].split("-");
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
        size="lg"
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
            <Form.Group as={Row} className="mb-3" controlId="inputName">
              <Form.Label
                className={styles.message}
                column
                lg={2}
                md={2}
                xs={12}>
                Term Name
              </Form.Label>
              <Col lg={10} md={10} xs={12}>
                <Form.Control
                  className={styles.comment}
                  name="name"
                  onChange={handleChange}
                  value={form.name}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-1" controlId="inputType">
              <Form.Label
                className={styles.message}
                column
                lg={2}
                md={2}
                xs={12}>
                Term Type
              </Form.Label>
              <Col
                className="d-flex justify-content-start align-items-center flex-wrap"
                lg={10}
                md={10}
                xs={12}>
                {types.type.map((item, index) => (
                  <Form.Check
                    key={index}
                    label={item}
                    value={item}
                    type="radio"
                    name="type"
                    checked={form.type === item}
                    className={`${styles.comment} mb-2`}
                    onChange={handleChange}
                    inline
                  />
                ))}
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-2" controlId="inputStartDate">
              <Form.Label
                className={styles.message}
                column
                lg={2}
                md={2}
                xs={12}>
                Start Date
              </Form.Label>
              <Col lg={10} md={10} xs={12}>
                <Form.Control
                  type="month"
                  className={styles.comment}
                  name="start_date"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      const [year, month] = value.split("-");
                      const startOfMonth = new Date(
                        Date.UTC(year, month - 1, 1)
                      );
                      handleChange({
                        target: {
                          name: "start_date",
                          value: startOfMonth.toISOString().slice(0, 10),
                        },
                      });
                    } else {
                      handleChange({
                        target: {
                          name: "start_date",
                          value: "",
                        },
                      });
                    }
                  }}
                  value={form.start_date.slice(0, 7)}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-2" controlId="inputEndDate">
              <Form.Label
                className={styles.message}
                column
                lg={2}
                md={2}
                xs={12}>
                End Date
              </Form.Label>
              <Col lg={10} md={10} xs={12}>
                <Form.Control
                  type="month"
                  min={form.start_date.slice(0, 7)}
                  className={styles.comment}
                  name="end_date"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      const date = new Date(value);
                      const endOfMonth = new Date(
                        date.getFullYear(),
                        date.getMonth() + 1,
                        0
                      );
                      handleChange({
                        target: {
                          name: "end_date",
                          value: endOfMonth.toISOString().slice(0, 10),
                        },
                      });
                    } else {
                      handleChange({
                        target: {
                          name: "end_date",
                          value: "",
                        },
                      });
                    }
                  }}
                  value={form.end_date.slice(0, 7)}
                  isInvalid={form.end_date < form.start_date}
                />
                <Form.Control.Feedback type="invalid">
                  End date must be after the start date.
                </Form.Control.Feedback>
              </Col>
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
          "Do you wish to save these changes? This may affect SWTD point calculations for this term."
        }
      />
    </>
  );
};

export default EditTermModal;
