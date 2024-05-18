import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container, Card, Row, Col, Form, InputGroup, Toast, ToastContainer, Spinner } from "react-bootstrap"; /* prettier-ignore */

import { isEmpty, isValidPassword } from "../../common/validation/utils";
import { useSwitch } from "../../hooks/useSwitch";
import { reset } from "../../api/auth";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import logo from "../../images/logo1.png";
import styles from "./style.module.css";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const [errorMessage, setErrorMessage] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);
  const [showModal, openModal, closeModal] = useSwitch();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShow = () => setShowToast(!showToast);

  const [form, setForm] = useState({
    token: token,
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
    if (isEmpty(form.password)) return false;
    return !isValidPassword(form.password);
  };

  const passwordsMatch = () => {
    return form.password === form.confirmPassword;
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    await reset(
      form,
      (response) => {
        setTimeout(() => {
          setIsResetComplete(true);
          setIsLoading(false);
          resetForm();
        });
      },
      (error) => {
        if (error.response) {
          setErrorMessage(error.response.data.error);
          setIsLoading(false);
          setShowToast(true);
          resetForm();
        }
      }
    );
  };

  return (
    <div className={styles.background}>
      <header className={styles.header}>
        {" "}
        <h3>
          <Link to="/login">
            <i className={`${styles.icon} fa-solid fa-caret-left fa-xl`}></i>
          </Link>{" "}
          Reset Password
        </h3>
      </header>

      {/* Error Toast */}
      <ToastContainer className="p-3" position="top-end">
        <Toast
          className={styles.toast}
          show={showToast}
          delay={5000}
          onClose={toggleShow}
          autohide>
          <Toast.Header className={styles.toastHeader}>
            <img
              src={logo}
              className={styles.image}
              height="20px"
              alt="PointWatch logo"
            />
            <strong className={`${styles.errorHeader} me-auto`}>
              Reset Password Error
            </strong>
          </Toast.Header>
          <Toast.Body>{errorMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Reset Password Form */}
      <Container className="d-flex justify-content-center align-items-center">
        <Card className="p-4" style={{ width: "45rem" }}>
          {!isResetComplete ? (
            <Card.Body>
              {isLoading ? (
                <Row>
                  <Col
                    className={`${styles.spinner} text-center d-flex justify-content-center align-items-center`}>
                    <Spinner className={styles.spinner} animation="border" />
                    Resetting password...
                  </Col>
                </Row>
              ) : (
                <>
                  <Row className="mb-4">
                    <Col className="text-center align-items-center justify-content-center">
                      <img
                        src={logo}
                        className="logo"
                        height="80px"
                        alt="PointWatch logo"
                      />
                      <span className={styles.brand}>PointWatch</span>
                    </Col>
                  </Row>
                  <Form className={styles.form} noValidate>
                    <Row>
                      <Col>
                        <Form.Group className="mb-3" controlId="inputPassword">
                          <InputGroup hasValidation>
                            <InputGroup.Text className={styles.iconBox}>
                              <i
                                className={`${styles.formIcon} fa-solid fa-lock fa-lg`}></i>
                            </InputGroup.Text>
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              value={form.password}
                              name="password"
                              className={styles.formBox}
                              onChange={handleChange}
                              placeholder="Password"
                              isInvalid={isPasswordValid()}
                            />
                            <InputGroup.Text className={styles.iconEye}>
                              <i
                                className={`${styles.icon} ${
                                  showPassword
                                    ? "fa-solid fa-eye fa-lg"
                                    : "fa-solid fa-eye-slash fa-lg"
                                }`}
                                onClick={() =>
                                  setShowPassword(!showPassword)
                                }></i>
                            </InputGroup.Text>
                            <Form.Control.Feedback type="invalid">
                              {isEmpty(form.password) ? (
                                <>Password is required.</>
                              ) : (
                                <>
                                  Must have at least 8 characters, one special
                                  character, and one number.
                                </>
                              )}
                            </Form.Control.Feedback>
                          </InputGroup>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Group
                          className="mb-3"
                          controlId="inputConfirmPassword">
                          <InputGroup hasValidation>
                            <InputGroup.Text className={styles.iconBox}>
                              <i
                                className={`${styles.formIcon} fa-solid fa-lock fa-lg`}></i>
                            </InputGroup.Text>
                            <Form.Control
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm Password"
                              name="confirmPassword"
                              className={styles.formBox}
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
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col className="text-center">
                        <BtnPrimary onClick={openModal}>Submit</BtnPrimary>
                        <ConfirmationModal
                          show={showModal}
                          onHide={closeModal}
                          onConfirm={handleSubmit}
                          header={"Reset Password"}
                          message={"Do you wish to save these changes?"}
                        />
                      </Col>
                    </Row>
                  </Form>
                </>
              )}
            </Card.Body>
          ) : (
            <Card.Body>
              <Row>
                <Col className="text-center mb-3">
                  <span className={styles.brand}>
                    Reset password successful!
                  </span>{" "}
                </Col>
              </Row>
              <Row>
                <Col className="text-center">
                  <BtnPrimary onClick={() => navigate("/login")}>
                    Proceed to Login
                  </BtnPrimary>
                </Col>
              </Row>
            </Card.Body>
          )}
        </Card>
      </Container>
    </div>
  );
};

export default ResetPassword;
