import React, { useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Form, Row, Col } from "react-bootstrap";

import SessionUserContext from "../../contexts/SessionUserContext";
import { updateUser } from "../../api/user";
import { getAllDepartments } from "../../api/user";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { isValidLength, isEmpty } from "../../common/validation/utils";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";

const General = () => {
  const { user, setUser } = useContext(SessionUserContext);
  const token = Cookies.get("userToken");

  const [isEditing, enableEditing, cancelEditing] = useSwitch();
  const [showModal, openModal, closeModal] = useSwitch();
  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [showError, triggerShowError] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    employee_id: "",
    firstname: "",
    lastname: "",
    department_id: 0,
  });

  const fetchDepartments = async () => {
    getAllDepartments(
      {
        token: token,
      },
      (response) => {
        setDepartments(response.departments);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "employee_id" && user?.employee_id !== null) {
      return;
    }
    setForm((prevForm) => ({
      ...prevForm,
      [name]: name === "department_id" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const invalidFields = () => {
    const emptyFields = ["employee_id", "firstname", "lastname"];
    const lengthFields = ["employee_id", "firstname", "lastname"];

    return (
      emptyFields.some((field) => isEmpty(form[field])) ||
      lengthFields.some((field) => !isValidLength(form[field], 1))
    );
  };

  const handleSubmit = async () => {
    await updateUser(
      {
        id: user.id,
        token: token,
        ...form,
      },
      (response) => {
        setUser(response.data.user);
        cancelEditing();
        triggerShowSuccess(4500);
      },
      (error) => {
        setErrorMessage(error.message);
        triggerShowError(4500);
      }
    );
  };

  const handleCancel = () => {
    setForm({
      ...form,
      firstname: user?.firstname,
      lastname: user?.lastname,
      department_id: user?.department?.id,
    });
    cancelEditing();
  };

  useEffect(() => {
    if (user) {
      setForm({
        employee_id: user.employee_id,
        firstname: user.firstname,
        lastname: user.lastname,
        department_id: user.department?.id ? user.department.id : 0,
      });
    }
    fetchDepartments();
  }, [user]);

  return (
    <Form className={styles.form} noValidate>
      {showError && (
        <div className="alert alert-danger mb-3" role="alert">
          {errorMessage}
        </div>
      )}

      {showSuccess && (
        <div className="alert alert-success mb-3" role="alert">
          Details changed!
        </div>
      )}

      <Row>
        <Col>
          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputEmployeeID">
              <Form.Label className={styles.formLabel} column md="2">
                Employee ID
              </Form.Label>
              {user?.employee_id === null && isEditing && (
                <Col md="9">
                  <Form.Control
                    className={styles.formBox}
                    name="employee_id"
                    onChange={handleChange}
                    value={form.employee_id}
                    isInvalid={isEmpty(form.employee_id)}
                  />

                  <Form.Control.Feedback type="invalid">
                    Employee ID is required.
                  </Form.Control.Feedback>

                  {!isEmpty(form.employee_id) && (
                    <Form.Text muted>
                      Ensure that your employee ID is correct. You will not be
                      able to change this again.
                    </Form.Text>
                  )}
                </Col>
              )}

              <Col
                className="d-flex justify-content-start align-items-center"
                md="9">
                {user?.employee_id}
              </Col>
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputEmail">
              <Form.Label className={styles.formLabel} column md="2">
                Email
              </Form.Label>
              <Col
                className="d-flex justify-content-start align-items-center"
                md="10">
                {user?.email}
              </Col>
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputFirstname">
              <Form.Label className={styles.formLabel} column md="2">
                First name
              </Form.Label>
              {isEditing ? (
                <Col md="10">
                  <Form.Control
                    className={styles.formBox}
                    name="firstname"
                    onChange={handleChange}
                    value={form.firstname}
                  />
                </Col>
              ) : (
                <Col
                  className="d-flex justify-content-start align-items-center"
                  md="9">
                  {user?.firstname}
                </Col>
              )}
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputLastname">
              <Form.Label className={styles.formLabel} column md="2">
                Last name
              </Form.Label>
              {isEditing ? (
                <Col md="10">
                  <Form.Control
                    className={styles.formBox}
                    type="text"
                    name="lastname"
                    onChange={handleChange}
                    value={form.lastname}
                  />
                </Col>
              ) : (
                <Col
                  className="d-flex justify-content-start align-items-center"
                  md="9">
                  {user?.lastname}
                </Col>
              )}
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputDepartments">
              <Form.Label className={styles.formLabel} column md="2">
                Department
              </Form.Label>
              {isEditing ? (
                <Col md="10">
                  <Form.Select
                    name="department_id"
                    className={styles.formBox}
                    onChange={handleChange}
                    value={form.department_id}
                    isInvalid={form.department_id === 0}>
                    <option value="0" disabled>
                      Select Department
                    </option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Department is required.
                  </Form.Control.Feedback>
                </Col>
              ) : (
                <Col
                  className="d-flex justify-content-start align-items-center"
                  md="9">
                  {user?.department?.name
                    ? user.department.name
                    : "No department set."}
                </Col>
              )}
            </Form.Group>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col className="text-end">
          {!isEditing ? (
            <BtnSecondary
              onClick={() => {
                enableEditing();
                setForm({ ...form });
              }}>
              Edit
            </BtnSecondary>
          ) : (
            <>
              <BtnPrimary onClick={openModal} disabled={invalidFields()}>
                Save Changes
              </BtnPrimary>{" "}
              <BtnSecondary onClick={handleCancel}>Cancel</BtnSecondary>
            </>
          )}
          <ConfirmationModal
            show={showModal}
            onHide={closeModal}
            onConfirm={handleSubmit}
            header={"Update Details"}
            message={"Do you wish to save these changes?"}
          />
        </Col>
      </Row>
    </Form>
  );
};

export default General;
