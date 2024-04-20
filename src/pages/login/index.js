import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Button,
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Modal,
  ToastContainer,
  Toast,
  Spinner,
} from "react-bootstrap";
import styles from "./style.module.css";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";

import { login, recovery } from "../../api/auth";
import { isEmpty, isValidEmail } from "../../common/validation/utils";
import SessionUserContext from "../../contexts/SessionUserContext";

import logo from "../../images/logo.png";
import logo1 from "../../images/logo1.png";

const Login = () => {
  const { setUser } = useContext(SessionUserContext);
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toggleShow = () => setShowToast(!showToast);

  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    setEmail("");
    setEmailSent(false);
    setEmailError(false);
  };
  const handleOpen = () => setShow(true);

  const [email, setEmail] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const clearForm = () => setForm({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    let hasError = false;
    let errorMessages = [];

    if (isEmpty(form.email)) {
      errorMessages.push(
        <>
          <b>Please enter an email.</b>
          <br />
        </>
      );
      hasError = true;
    } else if (!(form.email.length > 2 && isValidEmail(form.email))) {
      errorMessages.push(
        <>
          <b>Email</b> must be valid.
          <br />
        </>
      );
      hasError = true;
    }

    if (isEmpty(form.password)) {
      errorMessages.push(
        <>
          <b>Please enter a password.</b>
          <br />
        </>
      );
      hasError = true;
    }

    if (hasError) {
      setErrorMessage(errorMessages);
      setShowToast(true);
      setIsLoading(false);
      return;
    }

    await login(
      form,
      (response) => {
        setTimeout(() => {
          const accessToken = response?.data?.access_token;
          localStorage.setItem("accessToken", accessToken);
          setUser(accessToken);
          navigate("/dashboard");
          clearForm();
          setIsLoading(false);
        }, 4500);
      },
      (error) => {
        if (error.response) {
          let errorMessage = <b>{error.response.data.error}</b>;
          let statusCode = error.response.status;

          switch (statusCode) {
            case 401:
            case 404:
            case 403:
              setIsLoading(false);
              setErrorMessage(errorMessage);
              setShowToast(true);
              break;
            default:
              handleDefaultError();
              break;
          }
        } else {
          handleDefaultError();
        }
      }
    );

    const handleDefaultError = () => {
      setIsLoading(false);
      setErrorMessage(<>An error occurred.</>);
      setShowToast(true);
    };
  };

  // I modified this function to set the current tab URL to the backend endpopint for MS auth. THis initiates the sign in process
  const handleMicrosoftLogin = async () => {
    window.location.href = 'http://localhost:5000/auth/microsoft'
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    try {
      await recovery(
        { email },
        (response) => {
          setEmailSent(true);
          setEmailError(false);
          setEmail("");
        },
        (error) => {
          setEmailSent(false);
          setEmailError(true);
          setEmail("");
          console.error("Error sending recovery email:", error);
        }
      );
    } catch (error) {
      setEmail("");
      console.error("Error sending recovery email:", error);
    }
  };

  const openRegister = () => {
    window.open("/register", "_blank");
  };

  return (
    <div className={`${styles.Login} d-flex`}>
      <div
        className={`${styles.box} d-flex col-4 p-5 bg-white justify-content-center align-items-center`}>
        <Container>
          {/* Error Toast */}
          <ToastContainer className="p-3" position="top-start">
            <Toast
              className={styles.toast}
              show={showToast}
              delay={5000}
              onClose={toggleShow}
              autohide>
              <Toast.Header className={styles.toastHeader}>
                <img
                  src={logo1}
                  className={styles.image}
                  height="25px"
                  alt="PointWatch logo"
                />
                <strong className={`${styles.errorHeader} me-auto`}>
                  Login Error
                </strong>
              </Toast.Header>
              <Toast.Body>{errorMessage}</Toast.Body>
            </Toast>
          </ToastContainer>

          {/* Modal for Email to Reset Password */}
          {show && (
            <Modal show={show} onHide={handleClose} centered>
              <Modal.Header closeButton>
                <img src={logo1} alt="PointWatch logo" height="40px" />
                <Modal.Title className={styles.modalTitle}>
                  {" "}
                  Reset Password
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className={styles.modalBody}>
                {emailSent && !emailError && (
                  <>
                    Email sent successfully! Check your inbox{" "}
                    {
                      <Link
                        to="https://security.microsoft.com/quarantine"
                        target="_blank"
                        rel="noopener noreferrer">
                        here
                      </Link>
                    }{" "}
                    for further instructions.
                  </>
                )}
                {emailError && !emailSent && (
                  <>Error sending email. Please try again later.</>
                )}
                {!emailSent && !emailError && (
                  <>
                    Enter the email of your registered account below. An email
                    will be sent to guide you in resetting your password.
                    <InputGroup className="mt-3">
                      <InputGroup.Text>
                        <i
                          className={`${styles.icon} fa-solid fa-envelope fa-lg`}></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        value={email}
                        name="email"
                        onChange={handleEmail}
                        placeholder="Email"
                      />
                    </InputGroup>
                  </>
                )}
              </Modal.Body>
              <Modal.Footer>
                {!emailSent && !emailError && (
                  <Container>
                    <Row>
                      <Col className="text-end">
                        <BtnPrimary onClick={handleSendEmail}>
                          Submit
                        </BtnPrimary>
                      </Col>
                    </Row>
                  </Container>
                )}
              </Modal.Footer>
            </Modal>
          )}

          {/* Login Page */}
          <Row>
            <Col>
              <img
                src={logo}
                className="logo"
                height="90px"
                alt="PointWatch logo"
              />
            </Col>
          </Row>

          <Row className={styles.line1}>
            <span className={styles.line1}>Hello,</span>
            <span className={styles.line2}>welcome!</span>
          </Row>

          <Row className="mt-3 mb-3">
            <Form>
              <Form.Group className="mb-3" controlId="inputEmail">
                <InputGroup>
                  <InputGroup.Text className={styles.formBox}>
                    <i
                      className={`${styles.icon} fa-solid fa-envelope fa-lg`}></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    size="lg"
                    value={form.email}
                    name="email"
                    onChange={handleChange}
                    className={styles.formBox}
                    placeholder="Email"
                    required
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3" controlId="inputPassword">
                <InputGroup>
                  <InputGroup.Text className={styles.formBox}>
                    <i className={`${styles.icon} fa-solid fa-lock fa-lg`}></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    size="lg"
                    value={form.password}
                    name="password"
                    onChange={handleChange}
                    className={styles.formBox}
                    placeholder="Password"
                    required
                  />
                </InputGroup>
              </Form.Group>

              {isLoading ? (
                <Row className="mt-3">
                  <Col className={`${styles.spinner} text-center`}>
                    <Spinner animation="border" /> Signing in...
                  </Col>
                </Row>
              ) : (
                <>
                  <Row className="mb-4">
                    <Col className="text-end">
                      <span className={styles.password} onClick={handleOpen}>
                        Forgot password?
                      </span>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="auto">
                      <BtnPrimary
                        type="submit"
                        onClick={handleSubmit}
                        className={styles.button}>
                        Login
                      </BtnPrimary>
                    </Col>
                    <Col>
                      <BtnSecondary
                        onClick={openRegister}
                        className={styles.button}>
                        Register
                      </BtnSecondary>
                    </Col>
                    <Col className="text-end" md="auto">
                      <Button
                        className={styles.msButton}
                        onClick={handleMicrosoftLogin}>
                        Sign in with <i className="fa-brands fa-microsoft"></i>
                      </Button>
                    </Col>
                  </Row>
                </>
              )}
            </Form>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Login;
