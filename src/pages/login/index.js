import React, { useState } from "react";
import { Container, Row, Col, Form, InputGroup, Modal } from "react-bootstrap";
import styles from "./style.module.css";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";

import logo from "../../images/logo.png";
import logo1 from "../../images/logo1.png";

const Login = () => {
  const openRegister = () => {
    window.open("/register", "_blank");
  };

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleOpen = () => setShow(true);

  return (
    <div className={`${styles.Login} d-flex`}>
      <div
        className={`${styles.box} d-flex col-4 p-5 bg-white justify-content-center align-items-center`}>
        <Container>
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
                Enter the email of your registered account below. An email will
                be sent to guide you in resetting your password.
                <InputGroup className="mt-3">
                  <InputGroup.Text>
                    <i
                      className={`${styles.icon} fa-solid fa-envelope fa-lg`}></i>
                  </InputGroup.Text>
                  <Form.Control type="email" placeholder="Email" />
                </InputGroup>
              </Modal.Body>
              <Modal.Footer>
                <Container>
                  <Row>
                    <Col className="text-end">
                      <BtnPrimary onClick={handleClose}>Submit</BtnPrimary>
                    </Col>
                  </Row>
                </Container>
              </Modal.Footer>
            </Modal>
          )}
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
                  <span onClick={handleOpen}>Forgot password?</span>
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
