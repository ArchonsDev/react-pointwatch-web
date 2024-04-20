import React, { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";

import departments from "../../data/departments.json";
import { isValidLength, isEmpty } from "../../common/validation/utils";
import { useSwitch } from "../../hooks/useSwitch";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";

const General = () => {
  const [showModal, openModal, closeModal] = useSwitch();
  const [isClicked, setIsClicked] = useState(false);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    department: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const isFirstnameValid = () => {
    if (!isClicked) return false;
    return isEmpty(form.firstname) || !isValidLength(form.firstname, 1);
  };

  const isLastnameValid = () => {
    if (!isClicked) return false;
    return isEmpty(form.lastname) || !isValidLength(form.lastname, 1);
  };

  const handleSubmit = async () => {
    setIsClicked(true);
  };

  return (
    <Form className={styles.form} noValidate>
      <Row>
        <Col sm="3" className="text-center flex-column">
          <div className="d-flex justify-content-center align-items-center">
            <div className={`${styles.circle} mb-3`}></div>
          </div>
          <BtnPrimary>Change</BtnPrimary>
          <div className="mt-2">
            <BtnSecondary>Remove</BtnSecondary>
          </div>
        </Col>

        <Col sm="9">
          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputEmployeeID">
              <Form.Label className={styles.formLabel} column sm="3">
                Employee ID
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  className={styles.formBox}
                  type="text"
                  name="employee_id"
                  disabled
                />
              </Col>
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputEmail">
              <Form.Label className={styles.formLabel} column sm="3">
                Email
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  className={styles.formBox}
                  type="email"
                  name="email"
                  disabled
                />
              </Col>
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputFirstname">
              <Form.Label className={styles.formLabel} column sm="3">
                First name
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  className={styles.formBox}
                  type="text"
                  name="firstname"
                  onChange={handleChange}
                  value={form.firstname}
                  isInvalid={isFirstnameValid()}
                />
                {isClicked && (
                  <Form.Control.Feedback type="invalid">
                    {isEmpty(form.firstname) ? (
                      <>First name is required.</>
                    ) : (
                      <>First name is too short.</>
                    )}
                  </Form.Control.Feedback>
                )}
              </Col>
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputLastname">
              <Form.Label className={styles.formLabel} column sm="3">
                Last name
              </Form.Label>
              <Col sm="9">
                <Form.Control
                  className={styles.formBox}
                  type="text"
                  name="lastname"
                  onChange={handleChange}
                  value={form.lastname}
                  isInvalid={isLastnameValid()}
                />
                {isClicked && (
                  <Form.Control.Feedback type="invalid">
                    {isEmpty(form.lastname) ? (
                      <>Last name is required.</>
                    ) : (
                      <>Last name is too short.</>
                    )}
                  </Form.Control.Feedback>
                )}
              </Col>
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputDepartments">
              <Form.Label className={styles.formLabel} column sm="3">
                Department
              </Form.Label>
              <Col sm="9">
                <Form.Select
                  aria-label="Example"
                  name="department"
                  className={styles.formBox}
                  onChange={handleChange}
                  value={form.department}>
                  {departments.departments.map((department, index) => (
                    <option key={index} value={department}>
                      {department}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col className="text-end">
          <BtnPrimary onClick={openModal}>Save Changes</BtnPrimary>
          <ConfirmationModal
            show={showModal}
            onHide={closeModal}
            onConfirm={handleSubmit}
            header={"Update Password"}
            message={"Do you wish to save these changes?"}
          />
        </Col>
      </Row>
    </Form>
  );
};

export default General;
