import React, { useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Form, Row, Col, FloatingLabel, Table, Spinner } from "react-bootstrap";

import SessionUserContext from "../../contexts/SessionUserContext";
import classifications from "../../data/classification.json";
import { addDepartment, getAllDepartments } from "../../api/admin";
import { useTrigger } from "../../hooks/useTrigger";
import { useSwitch } from "../../hooks/useSwitch";
import { isEmpty } from "../../common/validation/utils";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";

const Department = () => {
  const { user } = useContext(SessionUserContext);
  const token = Cookies.get("userToken");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [showModal, openModal, closeModal] = useSwitch();
  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [showError, triggerShowError] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [selectedClassification, setSelectedClassification] = useState("");
  const [customClass, setCustomClass] = useState("");
  const [checkbox, setCheckbox] = useState({
    deptName: false,
    midyear: false,
  });
  const [form, setForm] = useState({
    name: "",
    classification: "",
    required_points: 0,
    has_midyear: false,
  });

  const fetchDepartments = async () => {
    getAllDepartments(
      {
        token: token,
      },
      (response) => {
        setDepartments(response.departments);
        setLoading(false);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const invalidFields = () => {
    const requiredFields = ["name", "classification"];
    return (
      requiredFields.some((field) => isEmpty(form[field])) ||
      form?.required_points <= 0
    );
  };

  const handleBoxChange = (e) => {
    const { id, checked } = e.target;
    setCheckbox({
      ...checkbox,
      [id]: checked,
    });

    setForm((prevForm) => ({
      ...prevForm,
      name:
        id === "deptName"
          ? checked
            ? prevForm.classification
            : ""
          : prevForm.name,
      has_midyear: id === "midyear" ? checked : prevForm.has_midyear,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: name === "required_points" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const clearForm = () => {
    setForm({
      name: "",
      classification: "",
      required_points: 0,
      has_midyear: false,
    });

    setCheckbox({
      deptName: false,
      midyear: false,
    });
    setSelectedClassification("");
    setCustomClass("");
  };

  const handleSubmit = async () => {
    await addDepartment(
      {
        ...form,
        token: token,
      },
      (response) => {
        triggerShowSuccess(3000);
        fetchDepartments();
        clearForm();
      },
      (error) => {
        setErrorMessage(error.message);
        triggerShowError(3000);
      }
    );
  };

  useEffect(() => {
    if (selectedClassification !== "Other") {
      setForm({
        ...form,
        classification: selectedClassification,
      });
    }
  }, [selectedClassification]);

  useEffect(() => {
    if (customClass) {
      setForm({
        ...form,
        classification: customClass,
      });
    }
  }, [customClass]);

  useEffect(() => {
    if (checkbox.deptName) {
      setForm((prevForm) => ({
        ...prevForm,
        name:
          selectedClassification === "Other"
            ? customClass
            : selectedClassification,
      }));
    }
  }, [selectedClassification, customClass, checkbox.deptName]);

  useEffect(() => {
    if (!user?.is_staff && !user?.is_superuser) {
      navigate("/swtd");
    }

    fetchDepartments();
  }, [user]);

  return (
    <>
      <Row className={`${styles.table} w-100`}>
        <span className="text-muted mb-3">
          Departments are required for employees to submit SWTDs.
        </span>
      </Row>

      <Form className={styles.form}>
        {showError && (
          <div className="alert alert-danger mb-3" role="alert">
            {errorMessage}
          </div>
        )}

        {showSuccess && (
          <div className="alert alert-success mb-3" role="alert">
            Department added.
          </div>
        )}

        {/* CHECKBOX */}
        <Row className="w-100 mb-3">
          <Col>
            <Form.Check
              inline
              type="checkbox"
              id="deptName"
              checked={checkbox.deptName}
              onChange={handleBoxChange}
            />
            <Form.Check.Label className="me-5">
              Use classification as department name
            </Form.Check.Label>
          </Col>

          <Col>
            <Form.Check
              inline
              type="checkbox"
              id="midyear"
              checked={checkbox.midyear}
              onChange={handleBoxChange}
            />
            <Form.Check.Label>
              Does this dept./office require SWTD points for the mid-year term?
            </Form.Check.Label>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <FloatingLabel
              controlId="floatingSelectClassification"
              label="Classification">
              <Form.Select
                className={styles.formBox}
                name="classification"
                onChange={(e) => {
                  setSelectedClassification(e.target.value);
                }}
                value={selectedClassification}>
                <option value="" disabled>
                  Select a classification
                </option>
                {classifications.classifications.map((cl, index) => (
                  <option key={index} value={cl}>
                    {cl}
                  </option>
                ))}
                <option value="Other">OTHER</option>
              </Form.Select>
            </FloatingLabel>
          </Col>

          {selectedClassification === "Other" && (
            <Col>
              <FloatingLabel
                controlId="floatingInputOther"
                label="Other Classification">
                <Form.Control
                  className={styles.formBox}
                  onChange={(e) => {
                    setCustomClass(e.target.value);
                  }}
                  value={customClass}
                />
              </FloatingLabel>
            </Col>
          )}
        </Row>

        <Row>
          <Col md={6}>
            <FloatingLabel
              controlId="floatingInputName"
              label="Department/Office Name"
              className="mb-3">
              <Form.Control
                className={styles.formBox}
                name="name"
                onChange={handleChange}
                value={form.name}
                disabled={checkbox.deptName}
              />
            </FloatingLabel>
          </Col>

          <Col md={2}>
            <FloatingLabel
              controlId="floatingInputPoints"
              label="Required Points"
              className="mb-3">
              <Form.Control
                type="number"
                min={0}
                className={styles.formBox}
                name="required_points"
                onChange={handleChange}
                value={form.required_points}
              />
            </FloatingLabel>
          </Col>
          <Col className="d-flex p-3">
            <Form.Text>(Not for Midyear/Summer if applicable)</Form.Text>
          </Col>
        </Row>

        <Row>
          <Col className="text-end">
            <BtnPrimary
              onClick={openModal}
              disabled={invalidFields()}
              title={invalidFields() ? "All fields are required." : ""}>
              Add Department
            </BtnPrimary>
          </Col>
          <ConfirmationModal
            show={showModal}
            onHide={closeModal}
            onConfirm={handleSubmit}
            header={"Add Department"}
            message={"Do you wish to add this department?"}
          />
        </Row>
      </Form>

      <hr />

      <Row className={`${styles.table}  w-100`}>
        {loading ? (
          <Row
            className={`${styles.loading} d-flex justify-content-center align-items-center w-100`}>
            <Spinner className={`me-2`} animation="border" />
            Loading departments...
          </Row>
        ) : departments.length === 0 ? (
          <Col className="text-center">No departments added yet.</Col>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Classification</th>
                <th>Department/Office Name</th>
                <th className="text-center col-1">Required Points</th>
                <th className="text-center">Has Midyear</th>
                <th className="text-center col-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department.id}>
                  <td>{department.classification}</td>
                  <td>{department.name}</td>
                  <td className="text-center">{department.required_points}</td>
                  <td className="text-center">
                    {department.has_midyear ? (
                      <i className="fa-solid fa-circle-check fa-lg text-success"></i>
                    ) : (
                      <i className="fa-solid fa-circle-xmark fa-lg text-danger"></i>
                    )}
                  </td>
                  <td className="text-center">
                    <i
                      className={`${styles.icon} fa-solid fa-pen-to-square fa-lg text-dark me-3`}
                      onClick={() => {}}></i>
                    <i
                      className={`${styles.icon} fa-solid fa-trash-can fa-lg text-danger`}
                      onClick={() => {}}></i>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* <EditTermModal
              show={showEditModal}
              onHide={closeEditModal}
              data={selectedTerm}
              editSuccess={editSuccess}
            />
            <ConfirmationModal
              show={showDeleteModal}
              onHide={closeDeleteModal}
              onConfirm={handleDelete}
              header={"Delete Term"}
              message={
                "Are you sure about deleting this term? It must not have any SWTD submissions linked to it."
              }
            /> */}
          </Table>
        )}
      </Row>
    </>
  );
};

export default Department;
