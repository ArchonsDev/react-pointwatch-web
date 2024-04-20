import React from "react";
import { Form, Row, Col } from "react-bootstrap";

import departments from "../../data/departments.json";

import BtnPrimary from "../../common/buttons/BtnPrimary";

const General = () => {
  return (
    <Form>
      <Row>
        <Form.Group as={Row} className="mb-3" controlId="inputEmployeeID">
          <Form.Label column sm="2">
            Employee ID
          </Form.Label>
          <Col sm="10">
            <Form.Control type="text" name="employee_d" disabled />
          </Col>
        </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Row} className="mb-3" controlId="inputEmail">
          <Form.Label column sm="2">
            Email
          </Form.Label>
          <Col sm="10">
            <Form.Control type="email" name="email" disabled />
          </Col>
        </Form.Group>
      </Row>
      <Row>
        <Form.Group as={Row} className="mb-3" controlId="inputFirstname">
          <Form.Label column sm="2">
            First name
          </Form.Label>
          <Col sm="10">
            <Form.Control type="text" name="firstname" />
          </Col>
        </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Row} className="mb-3" controlId="inputLastname">
          <Form.Label column sm="2">
            Last name
          </Form.Label>
          <Col sm="10">
            <Form.Control type="text" name="lastname" />
          </Col>
        </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Row} className="mb-3" controlId="inputDepartments">
          <Form.Label column sm="2">
            Department
          </Form.Label>
          <Col sm="10">
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
      <Row>
        <Col className="text-end">
          <BtnPrimary>Save Changes</BtnPrimary>
        </Col>
      </Row>
    </Form>
  );
};

export default General;
