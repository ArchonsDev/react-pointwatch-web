import React, { useContext, useState } from "react";
import Cookies from "js-cookie";
import { Row, Col, Form, Container } from "react-bootstrap";

import SessionUserContext from "../../contexts/SessionUserContext";
import { updatePassword } from "../../api/user";
import { useTrigger } from "../../hooks/useTrigger";
import { useSwitch } from "../../hooks/useSwitch";
import { isEmpty, isValidPassword } from "../../common/validation/utils";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";

const Password = () => {
  const { user, setUser } = useContext(SessionUserContext);
  const token = Cookies.get("userToken");

  const [showModal, openModal, closeModal] = useSwitch();
  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [showError, triggerShowError] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const resetForm = () => {
    setForm({
      currentPassword:"",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const isCurrentPasswordCorrect = () => {
    return form.currentPassword === user.password;
  }

  const isPasswordValid = () => {
    if (isEmpty(form.newPassword)) return false;
    return !isValidPassword(form.newPassword);
  };

  const passwordsMatch = () => {
    return form.newPassword === form.confirmPassword;
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
  
    if (!isCurrentPasswordCorrect()) {
      setErrorMessage("An error occurred. Please check details again.");
      triggerShowError(4500);
      return; 
    }

  
    await updatePassword(
      {
        id: user.id,
        token: token,
        ...form,
      },
      (response) => {
        setUser({
          ...user,
          newPassword: form.newPassword,
        });
        triggerShowSuccess(4500);
      },
      (error) => {
        if (error.response && error.response.data) {
          setErrorMessage(<>{error.response.data.error}</>);
          triggerShowError(4500);
        } else {
          setErrorMessage(<>An error occurred.</>);
          triggerShowError(4500);
        }
      }
    );
    resetForm();
  };

  return (
    <Container>
      {showError && (
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
          <Form.Group as={Row} className="mb-3" controlId="inputCurrentPassword">
            <Form.Label className={styles.formLabel} column sm="2">
              Current Password
            </Form.Label>
            <Col sm="10">
              <Form.Control
                type="password"
                name="currentPassword"
                className={styles.formBox}
                value={form.currentPassword}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>
        </Row>

        <Row>
          <Form.Group as={Row} className="mb-3" controlId="inputNewPassword">
            <Form.Label className={styles.formLabel} column sm="2">
              New Password
            </Form.Label>
            <Col sm="10">
              <Form.Control
                type="password"
                name="newPassword"
                className={styles.formBox}
                value={form.newPassword}
                onChange={handleChange}
                isInvalid={isPasswordValid()}
              />
              <Form.Control.Feedback type="invalid">
                {isEmpty(form.newPassword) ? (
                  <>Password is required.</>
                ) : (
                  <>
                    Must have at least 8 characters, one special character, and
                    one number.
                  </>
                )}
              </Form.Control.Feedback>
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

              <Form.Control.Feedback type="invalid">
                Passwords do not match.
              </Form.Control.Feedback>
            </Col>
          </Form.Group>
        </Row>

        <Row>
          <Col className="text-end">
            <BtnPrimary
              onClick={openModal}
              disabled={
                !isValidPassword(form.newPassword) ||
                !passwordsMatch() ||
                isEmpty(form.newPassword) ||
                isEmpty(form.confirmPassword)
              }>
              Save Changes
            </BtnPrimary>
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
