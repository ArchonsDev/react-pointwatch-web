import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import { Container, Card, Row, Col, Form, InputGroup } from "react-bootstrap";

import departments from "../../data/departments.json";
import { isValidEmail, isValidPassword } from "./utils";

import styles from "./style.module.css";
import BtnPrimary from "../../common/buttons/BtnPrimary";
import logo from "../../images/logo1.png";

const Registration = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const showErrorMessage = errorMessage !== null;
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

  const [form, setForm] = useState({
    email: "",
    idNum: "",
    firstname: "",
    lastname: "",
    department: "",
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

    if (!(form.firstname.length > 2)) {
      errorMessages.push(
        <>
          <b>Firstname</b> is too short.
          <br />
        </>
      );
      hasError = true;
    }

    if (!(form.lastname.length > 2)) {
      errorMessages.push(
        <>
          <b>Lastname</b> is too short.
          <br />
        </>
      );
      hasError = true;
    }

    if (!(form.email.length > 2 && isValidEmail(form.email))) {
      errorMessages.push(
        <>
          <b>Email</b> must be valid.
          <br />
        </>
      );
      hasError = true;
    }

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
      return;
    }

    try {
      console.log(form);
<<<<<<< HEAD
      const response = await axios.post("http://localhost:5000/auth/register", {
        employee_id: form.idNum,
        email: form.email,
        firstname: form.firstname,
        lastname: form.lastname,
        password: form.password,
        department: form.department,
      });
=======
      const response = await axios.post(
        "http://localhost:5000/auth/register",
        {
          employee_id: form.employee_id,
          email: form.email,
          firstname: form.firstname,
          lastname: form.lastname,
          password: form.password,
          department: form.department,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
>>>>>>> 2eca615e2f3e4fa979a51478321236383b7d16fc

      if (response.status === 200) {
        setIsRegistrationComplete(true);
      } else if (response.status === 409) {
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
      }
    }
  };

  return (
    <div className={styles.background}>
      <header className={`${styles.header}`}>
        <h2>
          <Link to="/login">
            <i className={`${styles.icon} fa-solid fa-caret-left fa-xl`}></i>
          </Link>{" "}
          Create Account
        </h2>
      </header>
      <Container className="d-flex justify-content-center align-items-center">
        <Card className="p-4" style={{ width: "60rem" }}>
          {!isRegistrationComplete ? (
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
                {/* Row 1: Email & ID Number */}
                {showErrorMessage && (
                  <div className="alert alert-danger mt-3" role="alert">
                    {errorMessage}
                  </div>
                )}
                <Row>
                  <Col>
                    <Form.Group className="mb-3" controlId="inputEmail">
                      <InputGroup>
                        <InputGroup.Text className={styles.iconBox}>
                          <i
                            className={`${styles.formIcon} fa-solid fa-at fa-lg`}></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          value={form.email}
                          name="email"
                          onChange={handleChange}
                          placeholder="E-mail"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3" controlId="inputIDNum">
                      <InputGroup>
                        <InputGroup.Text className={styles.iconBox}>
                          <i
                            className={`${styles.formIcon} fa-solid fa-id-badge fa-lg`}></i>
                        </InputGroup.Text>
                        <Form.Control
<<<<<<< HEAD
                          type="number"
                          value={form.idNum}
                          name="idNum"
=======
                          type="text"
                          value={form.employee_id}
                          name="employee_id"
>>>>>>> 2eca615e2f3e4fa979a51478321236383b7d16fc
                          onChange={handleChange}
                          placeholder="ID Number"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Row 2: First name & last name  */}
                <Row>
                  <Col>
                    <Form.Group className="mb-3" controlId="inputFirstname">
                      <InputGroup>
                        <InputGroup.Text className={styles.iconBox}>
                          <i
                            className={`${styles.formIcon} fa-solid fa-user fa-lg`}></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={form.firstname}
                          name="firstname"
                          onChange={handleChange}
                          placeholder="First name"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3" controlId="inputLastname">
                      <InputGroup>
                        <InputGroup.Text className={styles.iconBox}>
                          <i
                            className={`${styles.formIcon} fa-solid fa-user fa-lg`}></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={form.lastname}
                          name="lastname"
                          onChange={handleChange}
                          placeholder="Last name"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Row 3: Department */}
                <Row>
                  <Col>
                    <Form.Group className="mb-3" controlId="inputDepartment">
                      <InputGroup>
                        <InputGroup.Text className={styles.iconBox}>
                          <i
                            className={`${styles.formIcon} fa-solid fa-landmark fa-lg`}></i>
                        </InputGroup.Text>
                        <Form.Select
                          aria-label="Example"
                          value={form.department}
                          name="department"
                          onChange={handleChange}>
                          <option value="" disabled>
                            Departments
                          </option>
                          {departments.departments.map((department, index) => (
                            <option key={index} value={department}>
                              {department}
                            </option>
                          ))}
                        </Form.Select>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Row 4 & 5: Password */}
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
                    <BtnPrimary onClick={handleSubmit}>Register</BtnPrimary>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          ) : (
            <Card.Body>
              <span>Registration successful!</span>
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

export default Registration;
