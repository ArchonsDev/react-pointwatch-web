import React, { useContext, useState } from "react";
import Cookies from "js-cookie";
import { Row, Col, Form, Container, InputGroup } from "react-bootstrap";

import SessionUserContext from "../../contexts/SessionUserContext";
import { login } from "../../api/auth";
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

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      currentPassword: "",
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

  const isPasswordValid = () => {
    if (isEmpty(form.newPassword)) return false;
    return !isValidPassword(form.newPassword);
  };

  const passwordsMatch = () => {
    return form.newPassword === form.confirmPassword;
  };

  const update = async () => {
    setErrorMessage(null);
    await updatePassword(
      {
        id: user.id,
        token: token,
        password: form.newPassword,
      },
      (response) => {
        setUser({
          ...user,
          password: form.newPassword,
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

  const handleSubmit = async () => {
    setErrorMessage(null);

    await login(
      {
        email: user?.email,
        password: form.currentPassword,
      },
      (response) => {
        update();
      },
      (error) => {
        setErrorMessage("An error occurred. Please check details again.");
        triggerShowError(4500);
      }
    );
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
          <Form.Group
            as={Row}
            className="mb-3"
            controlId="inputCurrentPassword">
            <Form.Label className={styles.formLabel} column sm="2">
              Current Password
            </Form.Label>
            <Col sm="10">
              <InputGroup>
                <Form.Control
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  className={styles.formPasswordBox}
                  value={form.currentPassword}
                  onChange={handleChange}
                />
                <InputGroup.Text className={styles.iconEye}>
                  <i
                    className={`${styles.icon} ${
                      showCurrentPassword
                        ? "fa-solid fa-eye fa-lg"
                        : "fa-solid fa-eye-slash fa-lg"
                    }`}
                    onClick={() =>
                      setShowCurrentPassword(!showCurrentPassword)
                    }></i>
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Form.Group>
        </Row>

        <Row>
          <Form.Group as={Row} className="mb-3" controlId="inputNewPassword">
            <Form.Label className={styles.formLabel} column sm="2">
              New Password
            </Form.Label>
            <Col sm="10">
              <InputGroup hasValidation>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  className={styles.formPasswordBox}
                  value={form.newPassword}
                  onChange={handleChange}
                  isInvalid={isPasswordValid()}
                />
                <InputGroup.Text className={styles.iconEye}>
                  <i
                    className={`${styles.icon} ${
                      showPassword
                        ? "fa-solid fa-eye fa-lg"
                        : "fa-solid fa-eye-slash fa-lg"
                    }`}
                    onClick={() => setShowPassword(!showPassword)}></i>
                </InputGroup.Text>
                <Form.Control.Feedback type="invalid">
                  {isEmpty(form.newPassword) ? (
                    <>Password is required.</>
                  ) : (
                    <>
                      Must have at least 8 characters, one special character,
                      and one number.
                    </>
                  )}
                </Form.Control.Feedback>
              </InputGroup>
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
              <InputGroup hasValidation>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={styles.formPasswordBox}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  isInvalid={!passwordsMatch()}
                />
                <InputGroup.Text className={styles.iconEye}>
                  <i
                    className={`${styles.icon} ${
                      showConfirmPassword
                        ? "fa-solid fa-eye fa-lg"
                        : "fa-solid fa-eye-slash fa-lg"
                    }`}
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }></i>
                </InputGroup.Text>
                <Form.Control.Feedback type="invalid">
                  Passwords do not match.
                </Form.Control.Feedback>
              </InputGroup>
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
