import React from "react";
import { Form, Row, Col } from "react-bootstrap";

import departments from "../../data/departments.json";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import styles from "./style.module.css";

const General = () => {
  return (
    <Form className={styles.form}>
      <Row>
        <Col sm="3" className="mb-3">
          <div className={styles.pfpIcon}>
            <div className={`${styles.squareBox} mb-3`}>
              <i className="fa-solid fa-user fa-5x"></i>
            </div>
          </div>

          <div className={styles.buttonsContainer}>
            <BtnPrimary variant="primary" className="mb-2">Change</BtnPrimary>
            <BtnSecondary variant="outline-secondary">Delete</BtnSecondary>
          </div>
        </Col>

        <Col sm="9">
          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputEmployeeID">
              <Form.Label className={styles.formLabel} column sm="3">
                Employee ID
              </Form.Label>
              <Col sm="9">
                <Form.Control type="text" name="employee_d" disabled />
              </Col>
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputEmail">
              <Form.Label className={styles.formLabel} column sm="3">
                Email
              </Form.Label>
              <Col sm="9">
                <Form.Control type="email" name="email" disabled />
              </Col>
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputFirstname">
              <Form.Label className={styles.formLabel} column sm="3">
                First name
              </Form.Label>
              <Col sm="9">
                <Form.Control type="text" name="firstname" />
              </Col>
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputLastname">
              <Form.Label className={styles.formLabel} column sm="3">
                Last name
              </Form.Label>
              <Col sm="9">
                <Form.Control type="text" name="lastname" />
              </Col>
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputDepartments">
              <Form.Label className={styles.formLabel} column sm="3">
                Department
              </Form.Label>
              <Col sm="9">
                <Form.Select aria-label="Example" name="department">
                  <option value="" disabled>
                    Departments
                  </option>
                  {departments.departments.map((department, index) => (
                    <option key={index} value={department}>
                      {department}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>
          </Row>
        </Col>
      </Row>
      
      <Row>
        <Col className="text-end">
          <BtnPrimary>Save Changes</BtnPrimary>
        </Col>
      </Row>
    </Form>
  );
};

export default General;
