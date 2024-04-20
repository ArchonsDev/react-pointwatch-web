import React, { useState } from "react";
import { Row, Col, Form, Container } from "react-bootstrap";

import { updateUser } from "../../api/user";
import { useTrigger } from "../../hooks/useTrigger";
import { useSwitch } from "../../hooks/useSwitch";
import { isEmpty, isValidPassword } from "../../common/validation/utils";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";

const Password = () => {
  const [showModal, openModal, closeModal] = useSwitch();
  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isClicked, setIsClicked] = useState(false);

  const showErrorMessage = errorMessage !== null;

  const [form, setForm] = useState({
    token: localStorage.getItem("accessToken"),
    password: "",
    confirmPassword: "",
  });

  const resetForm = () => {
    setForm({
      password: "",
      confirmPassword: "",
    });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const isPasswordValid = () => {
    if (!isClicked) return false;
    return isEmpty(form.password) || !isValidPassword(form.password);
  };

  const passwordsMatch = () => {
    return form.password === form.confirmPassword;
  };

  const handleSubmit = async () => {
    setIsClicked(true);
    setErrorMessage(null);
    await updateUser(
      form,
      (response) => {
        setIsClicked(false);
        triggerShowSuccess(4500);
      },
      (error) => {
        if (error.response && error.response.data) {
          setErrorMessage(<>{error.response.data.error}</>);
          setIsClicked(false);
        } else {
          setErrorMessage(<>An error occurred.</>);
          setIsClicked(false);
        }
      }
    );
    resetForm();
  };

  return (
    <Container>
      {showErrorMessage && (
        <div className="alert alert-danger mb-3" role="alert">
          {errorMessage}
        </div>
      )}
      {showSuccess && (
        <div className="alert alert-success mb-3" role="alert">
          Password changed!
        </div>
      )}
      <Form className={styles.form} noValidate>
        <Row>
          <Form.Group as={Row} className="mb-3" controlId="inputPassword">
            <Form.Label className={styles.formLabel} column sm="2">
              Password
            </Form.Label>
            <Col sm="10">
              <Form.Control
                type="password"
                name="password"
                className={styles.formBox}
                value={form.password}
                onChange={handleChange}
                isInvalid={isPasswordValid()}
              />
              {isClicked && (
                <Form.Control.Feedback type="invalid">
                  {isEmpty(form.password) ? (
                    <>Password is required.</>
                  ) : (
                    <>
                      Must have at least 8 characters, one special character,
                      and one number.
                    </>
                  )}
                </Form.Control.Feedback>
              )}
            </Col>
          </Form.Group>
        </Row>

        <Row>
          <Form.Group
            as={Row}
            className="mb-3"
            controlId="inputConfirmPassword">
            <Form.Label className={styles.formLabel} column sm="2">
              Confirm Password
            </Form.Label>
            <Col sm="10">
              <Form.Control
                type="password"
                name="confirmPassword"
                className={styles.formBox}
                value={form.confirmPassword}
                onChange={handleChange}
                isInvalid={!passwordsMatch()}
              />
              {isClicked && (
                <Form.Control.Feedback type="invalid">
                  Passwords do not match.
                </Form.Control.Feedback>
              )}
            </Col>
          </Form.Group>
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
    </Container>
  );
};

export default Password;
