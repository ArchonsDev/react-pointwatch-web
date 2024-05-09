import React, { useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Form, Row, Col, Table } from "react-bootstrap";

import { addTerm, getTerms } from "../../api/admin";
import { isEmpty, isValidDate } from "../../common/validation/utils";
import { useSwitch } from "../../hooks/useSwitch";
import { useTrigger } from "../../hooks/useTrigger";
import SessionUserContext from "../../contexts/SessionUserContext";

import BtnPrimary from "../../common/buttons/BtnPrimary";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";
const Term = () => {
  const { user } = useContext(SessionUserContext);
  const token = Cookies.get("userToken");
  const navigate = useNavigate();

  const [showModal, openModal, closeModal] = useSwitch();
  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [showError, triggerShowError] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [terms, setTerms] = useState([]);
  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });

  const fetchTerms = () => {
    getTerms(
      {
        token: token,
      },
      (response) => {
        setTerms(response.terms);
        console.log(response.terms);
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
  };

  const clearForm = () => {
    setForm({
      name: "",
      start_date: "",
      end_date: "",
    });
  };

  const invalidFields = () => {
    const requiredFields = ["name", "start_date", "end_date"];
    return (
      requiredFields.some((field) => isEmpty(form[field])) ||
      !isValidDate(form.start_date) ||
      form.end_date < form.start_date
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
        fetchTerms();
        clearForm();
      },
      (error) => {
        console.log(error.message);
        setErrorMessage(error.message);
        triggerShowError(3000);
      }
    );
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
          <Form.Group as={Row} className="mb-3" controlId="inputName">
            <Form.Label className={styles.formLabel} column sm="2">
              Term
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

          <Row className="w-100">
            <Col>
              <Form.Group as={Row} className="mb-3" controlId="inputStartDate">
                <Form.Label className={styles.formLabel} column sm="4">
                  Start Date
                </Form.Label>
                <Col sm="8">
                  <Form.Control
                    type="date"
                    className={styles.formBox}
                    name="start_date"
                    onChange={handleChange}
                    value={form.start_date}
                  />
                </Col>
              </Form.Group>
            </Col>

            <Col>
              <Form.Group as={Row} className="mb-3" controlId="inputEndDate">
                <Form.Label
                  className={`${styles.formLabel} text-end`}
                  column
                  sm="4">
                  End Date
                </Form.Label>
                <Col sm="8">
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
            </Col>
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
      <Row className={`${styles.table}  w-100`}>
        {terms.length === 0 ? (
          <Col className="text-center">No terms added yet.</Col>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {terms &&
                terms.map((term) => (
                  <tr key={term.id}>
                    <td>{term.id}</td>
                    <td>{term.name}</td>
                    <td>{term.start_date}</td>
                    <td>{term.end_date}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
      </Row>
    </>
  );
};

export default Term;
