import React, { useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Form, Row, Col, Table, Spinner, FloatingLabel } from "react-bootstrap";

import types from "../../data/types.json";
import { addTerm, getTerms, deleteTerm } from "../../api/admin";
import { isEmpty } from "../../common/validation/utils";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import { monthYearDate } from "../../common/format/date";
import SessionUserContext from "../../contexts/SessionUserContext";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";
import EditTermModal from "../../common/modals/EditTermModal";
const Term = () => {
  const { user } = useContext(SessionUserContext);
  const token = Cookies.get("userToken");
  const navigate = useNavigate();

  const [showModal, openModal, closeModal] = useSwitch();
  const [showEditModal, openEditModal, closeEditModal] = useSwitch();
  const [showDeleteModal, openDeleteModal, closeDeleteModal] = useSwitch();
  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [showDeleteSuccess, triggerShowDeleteSuccess] = useTrigger(false);
  const [showEditSuccess, triggerShowEditSuccess] = useTrigger(false);
  const [showError, triggerShowError] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    type: "",
  });

  const fetchTerms = () => {
    getTerms(
      {
        token: token,
      },
      (response) => {
        setTerms(response.terms);
        setLoading(false);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "type") setSelectedType(e.target.value);
  };

  const clearForm = () => {
    setForm({
      name: "",
      start_date: "",
      end_date: "",
      type: "",
    });
    setSelectedType("");
  };

  const invalidFields = () => {
    const requiredFields = ["name", "start_date", "end_date"];
    return (
      requiredFields.some((field) => isEmpty(form[field])) ||
      form.end_date < form.start_date ||
      selectedType === ""
    );
  };

  const handleSubmit = async () => {
    if (!isEmpty(form.start_date)) {
      const [year, month, day] = form.start_date.split("-");
      form.start_date = `${month}-${day}-${year}`;
    }

    if (!isEmpty(form.end_date)) {
      const [year, month, day] = form.end_date.split("-");
      form.end_date = `${month}-${day}-${year}`;
    }

    await addTerm(
      {
        ...form,
        token: token,
      },
      (response) => {
        triggerShowSuccess(3000);
        setSelectedType("");
        fetchTerms();
        clearForm();
      },
      (error) => {
        setErrorMessage(error.message);
        triggerShowError(3000);
      }
    );
  };

  const handleDelete = () => {
    deleteTerm(
      {
        id: selectedTerm.id,
        token: token,
      },
      (response) => {
        triggerShowDeleteSuccess(4500);
        fetchTerms();
      },
      (error) => {
        setErrorMessage(error.message);
        triggerShowError(3000);
      }
    );
  };

  const editSuccess = async () => {
    triggerShowEditSuccess(3000);
    await fetchTerms();
  };

  useEffect(() => {
    if (user?.access_level === 1) navigate("/dashboard");
    else if (user?.access_level < 1) navigate("/swtd");
    fetchTerms();
  }, [user]);

  return (
    <>
      <Row className={`${styles.table} w-100`}>
        <span className="text-muted mb-3">
          Terms are required for employees to submit SWTDs.
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
            Term added.
          </div>
        )}

        {/* Term Type */}
        <Row className="mb-3">
          <Col md="auto">
            <Form.Label className={`${styles.formLabel}`}>Term Type</Form.Label>
          </Col>
          <Col>
            {types.type.map((item, index) => (
              <Form.Check
                key={index}
                type="radio"
                name="type"
                className="me-4"
                label={item}
                value={item}
                onChange={handleChange}
                checked={selectedType === item}
                inline
              />
            ))}
          </Col>
        </Row>

        {/* Term Name */}
        <Row className="mb-3">
          <Col>
            <FloatingLabel controlId="floatingTermName" label="Term Name">
              <Form.Control
                className={styles.formBox}
                name="name"
                onChange={handleChange}
                value={form.name}
              />
            </FloatingLabel>
          </Col>
        </Row>

        {/* Dates */}
        <Row>
          <Col className="mb-3">
            <FloatingLabel
              controlId="floatingStartDate"
              label="Start Date (Month & Year)">
              <Form.Control
                type="month"
                className={styles.formBox}
                name="start_date"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const [year, month] = value.split("-");
                    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
                    handleChange({
                      target: {
                        name: "start_date",
                        value: startOfMonth.toISOString().slice(0, 10),
                      },
                    });
                  } else {
                    handleChange({
                      target: {
                        name: "start_date",
                        value: "",
                      },
                    });
                  }
                }}
                value={form.start_date.slice(0, 7)}
              />
            </FloatingLabel>
          </Col>

          <Col className="mb-3">
            <FloatingLabel
              controlId="floatingEndDate"
              label="End Date (Month & Year)">
              <Form.Control
                type="month"
                min={form.start_date.slice(0, 7)}
                className={styles.formBox}
                name="end_date"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const date = new Date(value);
                    const endOfMonth = new Date(
                      date.getFullYear(),
                      date.getMonth() + 1,
                      0
                    );
                    handleChange({
                      target: {
                        name: "end_date",
                        value: endOfMonth.toISOString().slice(0, 10),
                      },
                    });
                  } else {
                    handleChange({
                      target: {
                        name: "end_date",
                        value: "",
                      },
                    });
                  }
                }}
                value={form.end_date.slice(0, 7)}
                isInvalid={form.end_date < form.start_date}
              />
              <Form.Control.Feedback type="invalid">
                End date must be after the start date.
              </Form.Control.Feedback>
            </FloatingLabel>
          </Col>
        </Row>

        <Row>
          <Col className="text-end">
            <BtnPrimary
              onClick={openModal}
              disabled={invalidFields()}
              title={invalidFields() ? "All fields are required." : ""}>
              Add Term
            </BtnPrimary>
          </Col>
          <ConfirmationModal
            show={showModal}
            onHide={closeModal}
            onConfirm={handleSubmit}
            header={"Add Term"}
            message={"Do you wish to add this term?"}
          />
        </Row>
      </Form>

      <hr />

      {showEditSuccess && (
        <div className={`${styles.form} alert alert-success mb-3`} role="alert">
          Term details updated successfully.
        </div>
      )}

      {showDeleteSuccess && (
        <div className={`${styles.form} alert alert-success mb-3`} role="alert">
          Term deleted.
        </div>
      )}

      <Row className={`${styles.table} w-100`}>
        {loading ? (
          <Row
            className={`${styles.loading} d-flex justify-content-center align-items-center w-100`}>
            <Spinner className={`me-2`} animation="border" />
            Loading terms...
          </Row>
        ) : terms.length === 0 ? (
          <Col className="text-center">No terms added yet.</Col>
        ) : (
          <>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Term Name</th>
                  <th className="col-1">Term Type</th>
                  <th className="col-2">Start Date</th>
                  <th className="col-2">End Date</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {terms &&
                  [...terms].reverse().map((term) => (
                    <tr key={term.id}>
                      <td>{term.name}</td>
                      <td>{term.type}</td>
                      <td>{monthYearDate(term.start_date)}</td>
                      <td>{monthYearDate(term.end_date)}</td>
                      <td className="text-center">
                        <i
                          className={`${styles.icon} fa-solid fa-pen-to-square fa-lg text-dark me-3`}
                          onClick={() => {
                            openEditModal();
                            setSelectedTerm(term);
                          }}></i>
                        <i
                          className={`${styles.icon} fa-solid fa-trash-can fa-lg text-danger`}
                          onClick={() => {
                            openDeleteModal();
                            setSelectedTerm(term);
                          }}></i>
                      </td>
                    </tr>
                  ))}
              </tbody>
              <EditTermModal
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
              />
            </Table>
          </>
        )}
      </Row>
    </>
  );
};

export default Term;
