import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Modal, Row, Col, Form, FloatingLabel } from "react-bootstrap";

import levels from "../../data/levels.json";
import types from "../../data/types.json";
import { updateDepartment } from "../../api/admin";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { formatDate } from "../format/date";
import { isEmpty } from "../validation/utils";

import ConfirmationModal from "./ConfirmationModal";
import BtnPrimary from "../buttons/BtnPrimary";
import styles from "./style.module.css";

const EditTermModal = ({ show, onHide, data }) => {
  const token = Cookies.get("userToken");
  const [showModal, openModal, closeModal] = useSwitch();
  const [showError, triggerShowError] = useTrigger(false);

  const [selectedLevel, setSelectedLevel] = useState("");
  const [customClass, setCustomClass] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [disable, setDisable] = useState(false);
  const [checkbox, setCheckbox] = useState({
    deptName: false,
  });

  const [termCheckbox, setTermCheckbox] = useState({
    semester: false,
    midyear: false,
    academic: false,
  });

  const termMapping = {
    SEMESTER: "semester",
    "MIDYEAR/SUMMER": "midyear",
    "ACADEMIC YEAR": "academic",
  };

  const [form, setForm] = useState({
    name: "",
    level: "",
    required_points: 0,
    midyear_points: 0,
    use_schoolyear: false,
  });

  const handleBoxChange = (e) => {
    const { id, checked } = e.target;
    setCheckbox({
      ...checkbox,
      [id]: checked,
    });

    const updatedTermCheckbox = {
      ...termCheckbox,
      semester: id === "SEMESTER" ? checked : termCheckbox.semester,
      midyear: id === "MIDYEAR/SUMMER" ? checked : termCheckbox.midyear,
      academic: id === "ACADEMIC YEAR" ? checked : termCheckbox.academic,
    };

    const checkedCount =
      Object.values(updatedTermCheckbox).filter(Boolean).length;
    setTermCheckbox(updatedTermCheckbox);
    setDisable(checkedCount >= 2);

    setForm((prevForm) => ({
      ...prevForm,
      name: id === "deptName" ? (checked ? prevForm.level : "") : prevForm.name,
      use_schoolyear:
        id === "ACADEMIC YEAR" ? checked : prevForm.use_schoolyear,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]:
        name === "required_points" || name === "midyear_points"
          ? parseInt(value, 10) || 0
          : value,
    }));
  };

  const resetForm = () => {
    if (data) {
      setForm({
        name: data.name,
        level: data.level,
        required_points: data.required_points,
        midyear_points: data.midyear_points,
      });
    }
  };

  const handleSubmit = () => {};

  useEffect(() => {
    if (data) {
      setSelectedLevel(data.level);
      setForm({
        name: data.name,
        level: data.level,
        required_points: data.required_points,
        midyear_points: data.midyear_points,
      });

      if (data.level === data.name) setCheckbox({ deptName: true });
      setTermCheckbox((prev) => ({
        ...prev,
        academic: data.use_schoolyear === true,
        midyear: data.midyear_points > 0,
      }));
    }
  }, [data]);

  return (
    <>
      <Modal
        size="lg"
        show={show}
        onHide={() => {
          onHide();
          resetForm();
        }}
        centered>
        <Modal.Header className={styles.header} closeButton>
          <Modal.Title>Edit Department</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showError && (
            <div
              className={`${styles.comment} alert alert-danger mb-3`}
              role="alert">
              {errorMessage}
            </div>
          )}
          <Form noValidate onSubmit={(e) => e.preventDefault()}>
            <Row className="mb-3">
              <Col lg={6} md={6}>
                <FloatingLabel controlId="floatingSelectLevel" label="Level">
                  <Form.Select
                    className={styles.formBox}
                    name="level"
                    onChange={(e) => {
                      setSelectedLevel(e.target.value);
                    }}
                    value={selectedLevel}>
                    <option value="" disabled>
                      Select a level
                    </option>
                    {levels.levels.map((cl, index) => (
                      <option key={index} value={cl}>
                        {cl}
                      </option>
                    ))}
                    <option value="Other">OTHER</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>

              {selectedLevel === "Other" && (
                <Col>
                  <FloatingLabel
                    controlId="floatingInputOther"
                    label="Other Level">
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

            {/* CHECKBOX */}
            <Row className="w-100 mb-3">
              <Col lg="auto" md={12} xs={12}>
                <Form.Check
                  inline
                  type="checkbox"
                  id="deptName"
                  checked={checkbox.deptName}
                  onChange={handleBoxChange}
                />
                <Form.Check.Label className="me-lg-5 me-0">
                  Use level as department name.
                </Form.Check.Label>
              </Col>
            </Row>

            <Row>
              <Col>
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
            </Row>

            <Row className="mb-2">
              <Col className={`p-1 ${styles.formSection}`}>
                <span className="ms-1">POINTS REQUIREMENT</span>
              </Col>
            </Row>

            {/* CHECKBOX */}
            <Row className="mb-3">
              <Col className="me-3" md="auto">
                <Form.Label className={`${styles.formLabel}`}>
                  Term Type
                </Form.Label>
              </Col>
              <Col>
                {types.type.map((item, index) => {
                  const isDisabled =
                    disable && !termCheckbox[termMapping[item]];
                  return (
                    <Form.Check
                      key={index}
                      type="checkbox"
                      name="type"
                      className="me-4"
                      label={item}
                      id={item}
                      checked={termCheckbox[termMapping[item]]}
                      onChange={handleBoxChange}
                      inline
                      disabled={isDisabled}
                    />
                  );
                })}
              </Col>
            </Row>

            <Row>
              <Col md={3}>
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

              <Col md={3}>
                <FloatingLabel
                  controlId="floatingInputMidyearPoints"
                  label="Midyear Points"
                  className="mb-3">
                  <Form.Control
                    type="number"
                    min={0}
                    className={styles.formBox}
                    name="midyear_points"
                    onChange={handleChange}
                    value={form.midyear_points}
                    disabled={!termCheckbox.midyear}
                  />
                </FloatingLabel>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Row className="w-100">
            <Col className="text-end">
              <BtnPrimary
                onClick={() => {
                  openModal();
                  onHide();
                }}>
                Save
              </BtnPrimary>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>
      <ConfirmationModal
        show={showModal}
        onHide={closeModal}
        onConfirm={handleSubmit}
        header={"Update Department"}
        message={
          "Do you wish to save these changes? This will affect SWTD point calculations for this term."
        }
      />
    </>
  );
};

export default EditTermModal;
