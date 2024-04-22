import React, { useContext, useState } from "react";
import { Form, Row, Col } from "react-bootstrap";

import departments from "../../data/departments.json";
import SessionUserContext from "../../contexts/SessionUserContext";
import { updateUser } from "../../api/user";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { isValidLength, isEmpty } from "../../common/validation/utils";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";

const General = () => {
  const { user, setUser } = useContext(SessionUserContext);
  const accessToken = localStorage.getItem("accessToken");

  const [isEditing, setIsEditing] = useState(false);
  const [showModal, openModal, closeModal] = useSwitch();
  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isClicked, setIsClicked] = useState(false);

  const showErrorMessage = errorMessage !== null;

  const [form, setForm] = useState({
    firstname: user?.firstname,
    lastname: user?.lastname,
    department: user?.department,
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const isFirstnameValid = () => {
    if (!isClicked) return false;
    return isEmpty(form.firstname) || !isValidLength(form.firstname, 1);
  };

  const isLastnameValid = () => {
    if (!isClicked) return false;
    return isEmpty(form.lastname) || !isValidLength(form.lastname, 1);
  };

  const handleDefaultError = () => {
    setErrorMessage(<>An error occurred.</>);
  };

  const handleSubmit = async () => {
    setIsClicked(true);

    await updateUser(
      {
        id: user.id,
        token: accessToken,
        ...form,
      },
      (response) => {
        setUser({
          ...user,
          firstname: form.firstname,
          lastname: form.lastname,
          department: form.department,
        });
        setIsEditing(false);
        triggerShowSuccess(4500);
      },
      (error) => {
        if (error.response) {
          let errorMessage = <b>{error.response.data.error}</b>;
          let statusCode = error.response.status;

          switch (statusCode) {
            case 401:
            case 404:
            case 403:
              setErrorMessage(errorMessage);
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

  const handleCancel = () => {
    setForm({
      firstname: user?.firstname,
      lastname: user?.lastname,
      department: user?.department,
    });
    setIsEditing(false);
  };

  return (
    <Form className={styles.form} noValidate>
      {showErrorMessage && (
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
        <Col sm="3" className="text-center flex-column">
          <div className="d-flex justify-content-center align-items-center">
            <div className={`${styles.circle} mb-3`}></div>
          </div>
          <BtnPrimary>Change</BtnPrimary>
          <div className="mt-2">
            <BtnSecondary>Remove</BtnSecondary>
          </div>
        </Col>

        <Col sm="9">
          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputEmployeeID">
              <Form.Label className={styles.formLabel} column sm="3">
                Employee ID
              </Form.Label>
              <Col sm="9">
                <Form.Control value={user?.employee_id} plaintext readOnly />
              </Col>
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputEmail">
              <Form.Label className={styles.formLabel} column sm="3">
                Email
              </Form.Label>
              <Col sm="9">
                <Form.Control value={user?.email} plaintext readOnly />
              </Col>
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputFirstname">
              <Form.Label className={styles.formLabel} column sm="3">
                First name
              </Form.Label>
              {isEditing ? (
                <Col sm="9">
                  <Form.Control
                    className={styles.formBox}
                    name="firstname"
                    onChange={handleChange}
                    value={form.firstname}
                    isInvalid={isFirstnameValid()}
                  />
                  {isClicked && (
                    <Form.Control.Feedback type="invalid">
                      {isEmpty(form.firstname) ? (
                        <>First name is required.</>
                      ) : (
                        <>First name is too short.</>
                      )}
                    </Form.Control.Feedback>
                  )}
                </Col>
              ) : (
                <Col sm="9">
                  <Form.Control value={user?.firstname} plaintext readOnly />
                </Col>
              )}
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputLastname">
              <Form.Label className={styles.formLabel} column sm="3">
                Last name
              </Form.Label>

              {isEditing ? (
                <Col sm="9">
                  <Form.Control
                    className={styles.formBox}
                    type="text"
                    name="lastname"
                    onChange={handleChange}
                    value={form.lastname}
                    isInvalid={isLastnameValid()}
                  />
                  {isClicked && (
                    <Form.Control.Feedback type="invalid">
                      {isEmpty(form.lastname) ? (
                        <>Last name is required.</>
                      ) : (
                        <>Last name is too short.</>
                      )}
                    </Form.Control.Feedback>
                  )}
                </Col>
              ) : (
                <Col sm="9">
                  <Form.Control value={user?.lastname} plaintext readOnly />
                </Col>
              )}
            </Form.Group>
          </Row>

          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputDepartments">
              <Form.Label className={styles.formLabel} column sm="3">
                Department
              </Form.Label>
              {isEditing ? (
                <Col sm="9">
                  <Form.Select
                    aria-label="Example"
                    name="department"
                    className={styles.formBox}
                    onChange={handleChange}
                    value={form.department}>
                    {departments.departments.map((department, index) => (
                      <option key={index} value={department}>
                        {department}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              ) : (
                <Col sm="9">
                  <Form.Control value={user?.department} plaintext readOnly />
                </Col>
              )}
            </Form.Group>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col sm="3"></Col>
        <Col className="text-end" sm="9">
          {!isEditing ? (
            <BtnSecondary onClick={() => setIsEditing(true)}>Edit</BtnSecondary>
          ) : (
            <>
              <BtnPrimary onClick={openModal}>Save Changes</BtnPrimary>{" "}
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
