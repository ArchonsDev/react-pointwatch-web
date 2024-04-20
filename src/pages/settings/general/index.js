import React from "react";
import { Card, Nav, Form, Col, Row, Dropdown, Button } from "react-bootstrap";
import styles from "./style.module.css";
import BtnPrimary from "../../common/buttons/BtnPrimary";

const General = () => {
  return (
    <div className={styles.background}>
      <Card className={styles.header}>
        <Card.Body className="d-flex justify-content-end">PointWatch</Card.Body>
      </Card>

      <h3 className={styles.word}>Settings</h3>

      <div className={styles.container}>
        <div className={styles.box}>
          <div className={styles.boxContent}>
            <Nav variant="tabs" defaultActiveKey="/settings/general">
              <Nav.Item>
                <Nav.Link href="/settings/general" className={styles.navHeader}>
                  General
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  href="/settings/password"
                  className={styles.navHeader}
                >
                  Password
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="/settings/logs"
                  className={styles.navHeader}
                >
                  Logs
                </Nav.Link>
              </Nav.Item>
            </Nav>
            <Form>
              <Form.Group
                as={Row}
                className={styles.credentials}
                controlId="Firstname"
              >
                <Form.Label column sm="2">
                  First name
                </Form.Label>
                <Col sm="10">
                  <Form.Control />
                </Col>
              </Form.Group>

              <Form.Group
                as={Row}
                className={styles.credentials}
                controlId="Lastname"
              >
                <Form.Label column sm="2">
                  Last name
                </Form.Label>
                <Col sm="10">
                  <Form.Control />
                </Col>
              </Form.Group>

              <Form.Group
                as={Row}
                className={styles.credentials}
                controlId="Email"
              >
                <Form.Label column sm="2">
                  Email
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    plaintext
                    readOnly
                    defaultValue="email@example.com"
                  />
                </Col>
              </Form.Group>

              <Form.Group className={styles.credentials} controlId="Department">
                <Form.Label column sm="2">
                  Department
                </Form.Label>
                <Col sm="10">
                  <Dropdown>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                      Departments
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item href="#/action-1">
                        Elementary
                      </Dropdown.Item>
                      <Dropdown.Item href="#/action-2">
                        Junior High School
                      </Dropdown.Item>
                      <Dropdown.Item href="#/action-3">
                        Senior High School
                      </Dropdown.Item>
                      <Dropdown.Item href="#/action-4">College</Dropdown.Item>
                      <Dropdown.Item href="#/action-5">
                        Administrative
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Form.Group>

              <Row>
                <Col className="text-center">
                  <BtnPrimary>Register</BtnPrimary>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default General;
