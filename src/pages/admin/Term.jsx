import React, { useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Form, Row, Col, Table } from "react-bootstrap";

import types from "../../data/types.json";
import { addTerm, getTerms, deleteTerm } from "../../api/admin";
import { isEmpty } from "../../common/validation/utils";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
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
    if (!user?.is_admin && !user?.is_superuser) {
      navigate("/swtd");
    }
    fetchTerms();
  }, []);

  return (
    <>
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

        <Row>
          {/* Term Name */}
          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputName">
              <Form.Label className={styles.formLabel} column sm="2">
                Term Name
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  className={styles.formBox}
                  name="name"
                  onChange={handleChange}
                  value={form.name}
                />
              </Col>
            </Form.Group>
          </Row>

          {/* Term Type */}
          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputType">
              <Form.Label className={`${styles.formLabel}`} column sm="2">
                Term Type
              </Form.Label>
              <Col
                className="d-flex justify-content-start align-items-center"
                sm="10">
                {types.type.map((item, index) => (
                  <Form.Check
                    key={index}
                    type="radio"
                    name="type"
                    label={item}
                    value={item}
                    onChange={handleChange}
                    checked={selectedType === item}
                    inline
                  />
                ))}
              </Col>
            </Form.Group>
          </Row>

          {/* Dates */}
          <Row>
            <Form.Group as={Row} className="mb-3" controlId="inputStartDate">
              <Form.Label className={`${styles.formLabel}`} column sm="2">
                Start Date
              </Form.Label>
              <Col sm="3">
                <Form.Control
                  type="date"
                  className={styles.formBox}
                  name="start_date"
                  onChange={handleChange}
                  value={form.start_date}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="inputEndDate">
              <Form.Label className={`${styles.formLabel}`} column sm="2">
                End Date
              </Form.Label>
              <Col sm="3">
                <Form.Control
                  type="date"
                  min={form.start_date}
                  className={styles.formBox}
                  name="end_date"
                  onChange={handleChange}
                  value={form.end_date}
                  isInvalid={form.end_date < form.start_date}
                />
                <Form.Control.Feedback type="invalid">
                  End date must be after the start date.
                </Form.Control.Feedback>
              </Col>
            </Form.Group>
          </Row>
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
      <Row className={`${styles.table}  w-100`}>
        {terms.length === 0 ? (
          <Col className="text-center">No terms added yet.</Col>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {terms &&
                terms.map((term) => (
                  <tr key={term.id}>
                    <td>{term.id}</td>
                    <td>{term.name}</td>
                    <td>{term.type}</td>
                    <td>{term.start_date}</td>
                    <td>{term.end_date}</td>
                    <td className="text-center">
                      <i
                        className={`${styles.icon} fa-solid fa-pen-to-square text-dark me-3`}
                        onClick={() => {
                          openEditModal();
                          setSelectedTerm(term);
                        }}></i>
                      <i
                        className={`${styles.icon} fa-solid fa-trash-can text-danger`}
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
        )}
      </Row>
    </>
  );
};

export default Term;
