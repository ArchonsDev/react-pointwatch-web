import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  InputGroup,
  Toast,
  ToastContainer,
} from "react-bootstrap";

import { isValidPassword } from "../../common/validation/utils";
import { reset } from "../../api/auth";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import logo from "../../images/logo1.png";
import styles from "./style.module.css";

const ResetPassword = ({ token }) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);

  const toggleShow = () => setShowToast(!showToast);

  const [form, setForm] = useState({
    token: token,
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage(null);

    let hasError = false;
    let errorMessages = [];

    if (!isValidPassword(form.password)) {
      errorMessages.push(
        <>
          <b>Password</b> must contain <b>at least one special character</b>.
          <br />
          <b>Password</b> be <b>at least 8 characters long</b>.<br />
          <b>Password</b> must contain <b>at least one number</b>.<br />
        </>
      );
      hasError = true;
    }

    if (form.password !== form.confirmPassword) {
      errorMessages.push(
        <>
          <b>Passwords</b> do not match.
          <br />
        </>
      );
      hasError = true;
    }

    if (hasError) {
      setErrorMessage(errorMessages);
      setShowToast(true);
      return;
    }

    await reset(
      form,
      (response) => {
        setTimeout(() => {
          setIsResetComplete(true);
        });
      },
      (error) => {
        if (error.response && error.response.status === 400) {
          setErrorMessage(<>{error.response.data.error}</>);
          setShowToast(true);
        } else if (error.response && error.response.status === 422) {
          setErrorMessage(<b>Token is null.</b>);
          setShowToast(true);
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
              <Form className={styles.form}>
                <Row>
                  <Col>
                    <Form.Group className="mb-3" controlId="inputPassword">
                      <InputGroup>
                        <InputGroup.Text className={styles.iconBox}>
                          <i
                            className={`${styles.formIcon} fa-solid fa-lock fa-lg`}></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="password"
                          value={form.password}
                          name="password"
                          onChange={handleChange}
                          placeholder="Password"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group
                      className="mb-3"
                      controlId="inputConfirmPassword">
                      <InputGroup>
                        <InputGroup.Text className={styles.iconBox}>
                          <i
                            className={`${styles.formIcon} fa-solid fa-lock fa-lg`}></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="password"
                          placeholder="Confirm Password"
                          name="confirmPassword"
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col className="text-center">
                    <BtnPrimary onClick={handleSubmit}>Submit</BtnPrimary>
                  </Col>
                </Row>
              </Form>
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
                  <BtnPrimary onClick={(e) => window.close()}>
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
