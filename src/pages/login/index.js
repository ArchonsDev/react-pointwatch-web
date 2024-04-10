import React from "react";
import { Container, Row, Col, Form, InputGroup } from "react-bootstrap";
import styles from "./style.module.css";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";

import logo from "../../images/logo.png";

const Login = () => {
  const openRegister = () => {
    window.open("/register", "_blank");
  };

  return (
    <div className={`${styles.Login} d-flex`}>
      <div
        className={`${styles.box} d-flex col-4 p-5 bg-white justify-content-center align-items-center`}>
        <Container>
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

          <Row className="mt-3">
            <Form>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1">
                <InputGroup>
                  <InputGroup.Text className={styles.formBox}>
                    <i
                      className={`${styles.icon} fa-solid fa-envelope fa-lg`}></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    size="lg"
                    placeholder="Email"
                    className={styles.formBox}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1">
                <InputGroup>
                  <InputGroup.Text className={styles.formBox}>
                    <i className={`${styles.icon} fa-solid fa-lock fa-lg`}></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    size="lg"
                    placeholder="Password"
                    className={styles.formBox}
                  />
                </InputGroup>
              </Form.Group>
              <Row className="mb-4">
                <Col className={`${styles.password} text-end`}>
                  <span>Forgot password?</span>
                </Col>
              </Row>
              <BtnPrimary className={styles.button}>Login</BtnPrimary>
              <BtnSecondary onClick={openRegister} className={styles.button}>
                Register
              </BtnSecondary>
            </Form>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Login;
