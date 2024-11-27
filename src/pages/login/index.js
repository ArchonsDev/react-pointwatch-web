import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Container, Row, Col, Form, InputGroup, Modal, ToastContainer, Toast, Spinner } from "react-bootstrap"; /* prettier-ignore */
import styles from "./style.module.css";

import SessionUserContext from "../../contexts/SessionUserContext";
import { login, recovery, register } from "../../api/auth";
import { isEmpty } from "../../common/validation/utils";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";

import logo1 from "../../images/logo1.png";

import { useMsal } from "@azure/msal-react";

const Login = () => {
  const { instance } = useMsal();
  const { setUser } = useContext(SessionUserContext);
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);

  const toggleShow = () => setShowToast(!showToast);

  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const [isClicked, setIsClicked] = useState(false);
  const [show, setShow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const [msForm, setMsForm] = useState({
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

  const handleDefaultError = () => {
    setIsLoading(false);
    setErrorMessage(<>An error occurred.</>);
    setShowToast(true);
    clearForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsClicked(true);

    await login(
      form,
      async (response) => {
        const userData = response.data.user;
        setUser(userData);

        const roles = {
          1: "/dashboard",
          2: "/hr-dashboard",
          3: "/admin",
        };
        const userAccessLevel = userData.access_level;
        navigate(roles[userAccessLevel] || "/swtd");

        setIsLoading(false);
        clearForm();
      },
      (error) => {
        console.log(error);
        if (error.response) {
          console.log(error.response);
          let errorMessage = <b>{error.response.data.error}</b>;
          let statusCode = error.response.status;

          switch (statusCode) {
            case 401:
            case 404:
            case 403:
              setIsLoading(false);
              setErrorMessage(errorMessage);
              setShowToast(true);
              clearForm();
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
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsEmailSending(true);

    try {
      await recovery(
        { email },
        (response) => {
          setIsEmailSending(false);
          setEmailSent(true);
          setEmailError(false);
          setEmail("");
        },
        (error) => {
          setIsEmailSending(false);

          setEmailSent(false);
          setEmailError(true);
          setEmail("");
          console.error("Error sending recovery email");
        }
      );
    } catch (error) {
      setIsEmailSending(false);
      setEmail("");
      console.error("Error sending recovery email");
    }
  };

  const splitFullName = (fullName) => {
    const nameParts = fullName.trim().split(" ");

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    const middleInitial =
      nameParts.length > 2
        ? nameParts
            .slice(1, -1)
            .map((name) => name.charAt(0).toUpperCase())
            .join(".") + "."
        : "";

    return {
      firstName,
      middleInitial,
      lastName,
    };
  };

  const hashString = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hash)); // Convert buffer to byte array
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""); // Convert bytes to hex string
    return hashHex;
  };

  const handleMSLogin = async () => {
    setIsLoading(true);
    setIsClicked(true);
    const loginRequest = {
      scopes: ["User.Read"], // Scopes needed to access the user profile
    };

    var response = null;

    // Initiate authentication with MS
    try {
      response = await instance.loginPopup(loginRequest);
    } catch {
      return;
    }

    const account = response?.account;
    if (!account) return;

    // Acquire user token
    try {
      response = await instance.acquireTokenSilent({
        scopes: ["User.Read"],
        account: account,
      });
    } catch {
      return;
    }
    const accessToken = response?.accessToken;
    if (!accessToken) return;

    // Request MS user data
    response = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const userData = await response.json();
    if (!userData) return;

    const email = userData.mail;
    const password = await hashString(userData.id);

    var isLoginSuccess = false;
    var error = null;

    await login(
      {
        email: email,
        password: password,
      },
      (r) => {
        console.log("Login successful.");
        isLoginSuccess = true;
      },
      (e) => {
        console.log("Login failed.");
        error = e;
      }
    );

    if (!isLoginSuccess) {
      const name = splitFullName(userData.displayName);
      var isRegistrationSuccess = false;

      await register(
        {
          employee_id: userData.jobTitle,
          email: email,
          firstname: name.firstName,
          lastname: name.lastName,
          password: password,
        },
        (r) => {
          console.log("Registration success");
          isRegistrationSuccess = true;
        },
        (e) => {
          console.log("Registration failed");
          console.log(e);
          error = e;
        }
      );
    }

    if (isRegistrationSuccess) {
      await login(
        {
          email: email,
          password: password,
        },
        (r) => {
          console.log("Login successful.");
          isLoginSuccess = true;
        },
        (e) => {
          console.log("Login failed.");
          error = e;
        }
      );
    }

    if (isLoginSuccess) navigate("/swtd");

    if (error?.response) {
      let errorMessage = <b>{error.response.data.error}</b>;
      let statusCode = error.response.status;

      switch (statusCode) {
        case 401:
        case 404:
        case 403:
          setIsLoading(false);
          setErrorMessage(errorMessage);
          setShowToast(true);
          clearForm();
          break;
        default:
          handleDefaultError();
          break;
      }
    } else {
      handleDefaultError();
    }
  };

  const handleMSLogout = () => {
    instance.logout();
  };

  return (
    <div className={`${styles.Login} d-flex`}>
      <div
        className={`d-flex col-lg-5 col-xl-4 p-lg-5 p-3 bg-white justify-content-center align-items-center`}>
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
                {isEmailSending ? (
                  <Row className="mt-3">
                    <Col
                      className={`${styles.spinner} text-center d-flex justify-content-center align-items-center`}>
                      <Spinner className={styles.spinner} animation="border" />
                      Checking email...
                    </Col>
                  </Row>
                ) : (
                  <>
                    {emailSent && !emailError && (
                      <>
                        Email sent successfully! If you are using Microsoft,
                        check{" "}
                        {
                          /* prettier-ignore */
                          <Link to="https://security.microsoft.com/quarantine" target="_blank" rel="noopener noreferrer"> 
                          here
                        </Link>
                        }{" "}
                        for further instructions or in your spam.
                      </>
                    )}

                    {emailError && !emailSent && (
                      <>Error sending email. Please try again later.</>
                    )}

                    {!emailSent && !emailError && (
                      <>
                        Enter the email of your registered account below. An
                        email will be sent to guide you in resetting your
                        password.
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
                  </>
                )}
              </Modal.Body>
              <Modal.Footer>
                {!emailSent && !emailError && !isEmailSending && (
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

          {/* Logo */}
          <Row>
            <Col>
              <img
                src={logo1}
                className="logo"
                height="70px"
                alt="PointWatch logo"
              />
            </Col>
          </Row>

          <Row className={`${styles.line1} mb-4`}>
            <span className={styles.line1}>Hello,</span>
            <span className={styles.line2}>welcome!</span>
          </Row>

          <Form onSubmit={handleSubmit}>
            <Row>
              <Form.Group className="mb-3" controlId="inputEmail">
                <InputGroup hasValidation>
                  <InputGroup.Text className={styles.iconBox}>
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
                    isInvalid={isClicked && isEmpty(form.email)}
                  />
                </InputGroup>
              </Form.Group>
            </Row>

            <Row>
              <Form.Group className="mb-3" controlId="inputPassword">
                <InputGroup>
                  <InputGroup.Text className={styles.iconBox}>
                    <i className={`${styles.icon} fa-solid fa-lock fa-lg`}></i>
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    size="lg"
                    value={form.password}
                    name="password"
                    onChange={handleChange}
                    className={styles.passwordBox}
                    placeholder="Password"
                    required
                    isInvalid={isClicked && isEmpty(form.password)}
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
                </InputGroup>
              </Form.Group>
            </Row>

            {isLoading ? (
              <Row className="mt-3">
                <Col
                  className={`${styles.spinner} text-center d-flex justify-content-center align-items-center`}>
                  <Spinner className={styles.spinner} animation="border" />{" "}
                  Signing in...
                </Col>
              </Row>
            ) : (
              <>
                <Row className="mb-3">
                  <Col className="text-end">
                    <span className={styles.password} onClick={handleOpen}>
                      Forgot password?
                    </span>
                  </Col>
                </Row>

                <Row className="g-lg-5">
                  <Col className="mb-2" md={6} xs={12}>
                    <Row className="ps-lg-0 pe-lg-0 ps-md-3 pe-md-3 ps-3 pe-3">
                      <BtnPrimary
                        type="submit"
                        disabled={
                          isEmpty(form.email) || isEmpty(form.password)
                        }>
                        Login
                      </BtnPrimary>
                    </Row>
                  </Col>

                  <Col className="mb-2" md={6} xs={12}>
                    <Row className="ps-lg-0 pe-lg-0 ps-md-3 pe-md-3 ps-3 pe-3">
                      <BtnSecondary onClick={() => navigate("/register")}>
                        Register
                      </BtnSecondary>
                    </Row>
                  </Col>
                </Row>

                <Row className="mt-1 mb-3 text-center">
                  <Col>
                    <span className={styles.orText}>or</span>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Row className="ps-lg-0 pe-lg-0 ps-md-3 pe-md-3 ps-3 pe-3">
                      <Button
                        className={`${styles.msButton} w-100`}
                        onClick={handleMSLogin}>
                        Sign in with <i className="fa-brands fa-microsoft"></i>
                      </Button>
                    </Row>
                  </Col>
                </Row>
              </>
            )}
          </Form>
        </Container>
      </div>
    </div>
  );
};

export default Login;
