import React from "react";
import { Link } from "react-router-dom";
import styles from "./style.module.css";
import { Container, Card, Row, Col, Form, InputGroup } from "react-bootstrap";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import logo from "../../images/logo1.png";

const Registration = () => {
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
              <Row>
                <Col>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1">
                    <InputGroup>
                      <InputGroup.Text className={styles.iconBox}>
                        <i
                          className={`${styles.formIcon} fa-solid fa-at fa-lg`}></i>
                      </InputGroup.Text>
                      <Form.Control type="email" placeholder="E-mail" />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1">
                    <InputGroup>
                      <InputGroup.Text className={styles.iconBox}>
                        <i
                          className={`${styles.formIcon} fa-solid fa-id-badge fa-lg`}></i>
                      </InputGroup.Text>
                      <Form.Control type="number" placeholder="ID Number" />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

              {/* Row 2: First name & last name  */}
              <Row>
                <Col>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1">
                    <InputGroup>
                      <InputGroup.Text className={styles.iconBox}>
                        <i
                          className={`${styles.formIcon} fa-solid fa-user fa-lg`}></i>
                      </InputGroup.Text>
                      <Form.Control type="text" placeholder="First name" />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1">
                    <InputGroup>
                      <InputGroup.Text className={styles.iconBox}>
                        <i
                          className={`${styles.formIcon} fa-solid fa-user fa-lg`}></i>
                      </InputGroup.Text>
                      <Form.Control type="text" placeholder="Last name" />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

              {/* Row 3: Department */}
              <Row>
                <Col>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1">
                    <InputGroup>
                      <InputGroup.Text className={styles.iconBox}>
                        <i
                          className={`${styles.formIcon} fa-solid fa-landmark fa-lg`}></i>
                      </InputGroup.Text>
                      <Form.Select defaultValue="Department">
                        <option disabled>Department</option>
                        <option>Elementary Department</option>
                        <option>Junior High School Department</option>
                        <option>Senior High School Department</option>
                        <option>College Department</option>
                        <option>Administrative Department</option>
                      </Form.Select>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

              {/* Row 4 & 5: Password */}
              <Row>
                <Col>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1">
                    <InputGroup>
                      <InputGroup.Text className={styles.iconBox}>
                        <i
                          className={`${styles.formIcon} fa-solid fa-lock fa-lg`}></i>
                      </InputGroup.Text>
                      <Form.Control type="password" placeholder="Password" />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1">
                    <InputGroup>
                      <InputGroup.Text className={styles.iconBox}>
                        <i
                          className={`${styles.formIcon} fa-solid fa-lock fa-lg`}></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="password"
                        placeholder="Confirm Password"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col className="text-center">
                  <BtnPrimary>Register</BtnPrimary>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Registration;
