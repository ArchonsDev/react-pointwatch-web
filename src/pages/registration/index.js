import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Card, Row, Col, Form, InputGroup, Toast,ToastContainer} from "react-bootstrap"; /* prettier-ignore */

import { register } from "../../api/auth";
import { getAllDepartments } from "../../api/user";
import { isEmpty, isValidLength, isValidEmail, isValidPassword } from "../../common/validation/utils"; /* prettier-ignore */
import { useSwitch } from "../../hooks/useSwitch";

import DataPrivacyModal from "../../common/modals/DataPrivacyModal";
import styles from "./style.module.css";
import BtnPrimary from "../../common/buttons/BtnPrimary";
import logo from "../../images/logo1.png";

const Registration = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [levels, setLevels] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, openModal, closeModal] = useSwitch();

  const toggleShow = () => setShowToast(!showToast);

  const [form, setForm] = useState({
    email: "",
    employee_id: "",
    firstname: "",
    lastname: "",
    password: "",
    department_id: 0,
    confirmPassword: "",
    checkbox: false,
  });

  const fetchDepartments = async () => {
    getAllDepartments(
      (response) => {
        setDepartments(response.departments);
        const uniqueLevels = [
          ...new Set(response.departments.map((dept) => dept.level)),
        ];
        setLevels(uniqueLevels);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleLevelChange = (e) => {
    const level = e.target.value;
    setSelectedLevel(level);
    setForm({ ...form, department_id: 0 });
  };

  const filteredDepartments = selectedLevel
    ? departments.filter((dept) => dept.level === selectedLevel)
    : departments;

  const passwordsMatch = () => {
    return form.password === form.confirmPassword;
  };

  const invalidFields = () => {
    const requiredFields = [
      "email",
      "employee_id",
      "firstname",
      "lastname",
      "password",
      "confirmPassword",
    ];
    return (
      requiredFields.some((field) => isEmpty(form[field])) ||
      !isValidEmail(form.email) ||
      !isValidLength(form.employee_id, 1) ||
      !isValidLength(form.firstname, 1) ||
      !isValidLength(form.lastname, 1) ||
      !isValidPassword(form.password) ||
      !passwordsMatch() ||
      form.department_id === 0 ||
      !form.checkbox
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsProcessing(true);

    if (invalidFields()) {
      setErrorMessage("Please check the details again.");
      setIsProcessing(false);
      return;
    }
    const updatedForm = {
      ...form,
      department_id: parseInt(form.department_id, 10),
    };
    await register(
      updatedForm,
      (response) => {
        setTimeout(() => {
          setIsRegistrationComplete(true);
          setIsProcessing(false);
        });
      },
      (error) => {
        if (error.response && error.response.status === 409) {
          setErrorMessage(<b>{error.response.data.error}</b>);
          setShowToast(true);
        }
        setIsProcessing(false);
      }
    );
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className={styles.background}>
      <header className={`${styles.header} mb-3`}>
        <h3 className="text-white">
          <Link to="/login">
            <i
              className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}></i>
          </Link>{" "}
          Create Account
        </h3>
      </header>

      {/* Error Toast */}
      <ToastContainer className="p-3" position="top-end">
        <Toast
          className={styles.toast}
          show={showToast}
          delay={5000}
          onClose={toggleShow}
          autohide>
          <Toast.Header className={styles.toastHeader}>
            <img
              src={logo}
              className={styles.image}
              height="20px"
              alt="PointWatch logo"
            />
            <strong className={`${styles.errorHeader} me-auto`}>
              Registration Error
            </strong>
          </Toast.Header>
          <Toast.Body>{errorMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Registration Form */}
      <Container className="d-flex justify-content-center align-items-center">
        <Card className="w-75 p-lg-4 p-2">
          {!isRegistrationComplete ? (
            <Card.Body>
              <Row className="mb-4">
                <Col className="text-center align-items-center justify-content-center">
                  <img
                    src={logo}
                    className="logo"
                    height="70px"
                    alt="PointWatch logo"
                  />
                  <span className={styles.brand}>PointWatch</span>
                </Col>
              </Row>
              <Form className={styles.form} noValidate>
                {/* Row 1: Email & ID Number */}
                <Row>
                  <Col lg={6} md={12} xs={12}>
                    <Form.Group className="mb-3" controlId="inputEmail">
                      <InputGroup hasValidation>
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
                          isInvalid={
                            !isEmpty(form.email) && !isValidEmail(form.email)
                          }
                        />
                        {!isEmpty(form.email) && !isValidEmail(form.email) && (
                          <Form.Control.Feedback type="invalid">
                            <>E-mail must be valid.</>
                          </Form.Control.Feedback>
                        )}
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col lg={6} md={12} xs={12}>
                    <Form.Group className="mb-3" controlId="inputEmployeeID">
                      <InputGroup hasValidation>
                        <InputGroup.Text className={styles.iconBox}>
                          <i
                            className={`${styles.formIcon} fa-solid fa-id-badge fa-lg`}></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={form.employee_id}
                          name="employee_id"
                          onChange={handleChange}
                          placeholder="Employee ID"
                          isInvalid={
                            !isEmpty(form.employee_id) &&
                            !isValidLength(form.employee_id, 1)
                          }
                        />
                        {!isEmpty(form.employee_id) &&
                          !isValidLength(form.employee_id, 1) && (
                            <Form.Control.Feedback type="invalid">
                              <>Employee ID must be valid.</>
                            </Form.Control.Feedback>
                          )}
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Row 2: First name & last name  */}
                <Row>
                  <Col md={6} xs={12}>
                    <Form.Group className="mb-3" controlId="inputFirstname">
                      <InputGroup hasValidation>
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
                          isInvalid={
                            !isEmpty(form.firstname) &&
                            !isValidLength(form.firstname, 1)
                          }
                        />
                        {!isEmpty(form.firstname) &&
                          !isValidLength(form.firstname, 1) && (
                            <Form.Control.Feedback type="invalid">
                              <>First name is too short.</>
                            </Form.Control.Feedback>
                          )}
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6} xs={12}>
                    <Form.Group className="mb-3" controlId="inputLastname">
                      <InputGroup hasValidation>
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
                          isInvalid={
                            !isEmpty(form.lastname) &&
                            !isValidLength(form.lastname, 1)
                          }
                        />
                        {!isEmpty(form.lastname) &&
                          !isValidLength(form.lastname, 1) && (
                            <Form.Control.Feedback type="invalid">
                              Last name is too short.
                            </Form.Control.Feedback>
                          )}
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} xs={12}>
                    <Form.Group className="mb-3" controlId="selectLevel">
                      <InputGroup hasValidation>
                        <InputGroup.Text className={styles.iconBox}>
                          <i
                            className={`${styles.formIcon} fa-solid fa-landmark fa-lg`}></i>
                        </InputGroup.Text>
                        <Form.Select
                          name="selected_level"
                          onChange={handleLevelChange}
                          value={selectedLevel || ""}>
                          <option value="" disabled>
                            Select Level
                          </option>
                          {levels
                            .sort((a, b) => a.localeCompare(b))
                            .map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                        </Form.Select>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={6} xs={12}>
                    <Form.Group className="mb-3" controlId="selectDepartment">
                      <InputGroup hasValidation>
                        <InputGroup.Text className={styles.iconBox}>
                          <i
                            className={`${styles.formIcon} fa-solid fa-book fa-lg`}></i>
                        </InputGroup.Text>
                        <Form.Select
                          name="department_id"
                          onChange={handleChange}
                          value={form.department_id}
                          disabled={!selectedLevel}>
                          <option value={0} disabled>
                            Departments
                          </option>
                          {filteredDepartments
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((department) => (
                              <option key={department.id} value={department.id}>
                                {department.name}
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
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          className={styles.passwordBox}
                          name="password"
                          onChange={handleChange}
                          placeholder="Password"
                          isInvalid={
                            !isEmpty(form.password) &&
                            !isValidPassword(form.password)
                          }
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
                        {!isEmpty(form.password) &&
                          !isValidPassword(form.password) && (
                            <Form.Control.Feedback type="invalid">
                              Must have at least 8 characters, one special
                              character, and one number.
                            </Form.Control.Feedback>
                          )}
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
                          type={showConfirmPassword ? "text" : "password"}
                          className={styles.passwordBox}
                          placeholder="Confirm Password"
                          name="confirmPassword"
                          onChange={handleChange}
                          isInvalid={!passwordsMatch()}
                        />
                        <InputGroup.Text className={styles.iconEye}>
                          <i
                            className={`${styles.icon} ${
                              showConfirmPassword
                                ? "fa-solid fa-eye fa-lg"
                                : "fa-solid fa-eye-slash fa-lg"
                            }`}
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }></i>
                        </InputGroup.Text>
                        {!isEmpty(form.password) && (
                          <Form.Control.Feedback type="invalid">
                            Passwords do not match.
                          </Form.Control.Feedback>
                        )}
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="w-100">
                  <Col className="d-flex justify-content-center align-items-center mb-3">
                    <Form.Check
                      className="me-2"
                      name="checkbox"
                      checked={form.checkbox}
                      onChange={handleChange}
                      type="checkbox"
                      id="dataCheckbox"
                    />
                    <span className="me-1">I have read and understand the</span>
                    <span className={styles.boldText} onClick={openModal}>
                      Privacy Notice
                    </span>
                    .
                  </Col>
                </Row>

                <Row>
                  <Col className="text-center">
                    <BtnPrimary
                      onClick={handleSubmit}
                      disabled={invalidFields() || isProcessing} // Disable when processing or fields are invalid
                      title={
                        invalidFields() ? "Please check the details again." : ""
                      }>
                      {isProcessing ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"></span>
                      ) : (
                        "Register"
                      )}
                    </BtnPrimary>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          ) : (
            <Card.Body>
              <Row>
                <Col className="text-center mb-3">
                  <span className={styles.brand}>Registration successful!</span>{" "}
                </Col>
              </Row>
              <Row>
                <Link to="/login">
                  <Col className="text-center">
                    <BtnPrimary>Proceed to Login</BtnPrimary>
                  </Col>
                </Link>
              </Row>
            </Card.Body>
          )}
        </Card>

        <DataPrivacyModal show={showModal} onHide={closeModal} />
      </Container>
    </div>
  );
};

export default Registration;
