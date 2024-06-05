import React, { useContext, useEffect, useState } from "react";
import { Row, Col, Container, DropdownButton, Dropdown, Modal, Spinner} from "react-bootstrap"; /* prettier-ignore */
import Cookies from "js-cookie";

// Comfig
import departmentTypes from "../../data/departmentTypes.json";

// Context
import SessionUserContext from "../../contexts/SessionUserContext";

// CSS
import styles from "./style.module.css";

// Custom Components
import SWTDTable from "../../components/SWTDTable";
import SWTDInfo from "./SWTDInfo";

// API
import { getClearanceStatus } from "../../api/user";
import { getTerms } from "../../api/admin";
import { getAllSWTDs } from "../../api/swtd";

// Custom Hooks
import { useSwitch } from "../../hooks/useSwitch";
import { useSelector } from "react-redux";

const SWTDDashboard = () => {
  const id = Cookies.get("userID");
  const token = Cookies.get("userToken");

  const user = useSelector(state => state.sessionUser.user);

  const [showPointsModal, openPointsModal, closePointsModal] = useSwitch();

  const [userSWTDs, setUserSWTDs] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [termStatus, setTermStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAllSWTDs = async () => {
    await getAllSWTDs(
      {
        author_id: id,
        token: token,
      },
      (response) => {
        setUserSWTDs(response.swtds);
        setLoading(false);
      },
      (error) => {
        if (error.response && error.response.data) {
          console.log(error.response.data.error);
        }
      }
    );
  };

  const fetchTerms = () => {
    const allowedTerm = departmentTypes[user?.department];
    getTerms(
      {
        token: token,
      },
      (response) => {
        const filteredTerms = response.terms.filter((term) =>
          allowedTerm.includes(term.type)
        );
        setTerms(filteredTerms);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const fetchClearanceStatus = (term) => {
    getClearanceStatus(
      {
        id: id,
        term_id: term.id,
        token: token,
      },
      (response) => {
        setTermStatus(response);
      }
    );
  };

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      fetchTerms();
      fetchAllSWTDs();
    }
  }, [user]);

  if (loading)
    return (
      <Row
        className={`${styles.loading} d-flex justify-content-center align-items-center w-100`}>
        <Spinner className={`me-2`} animation="border" />
        Loading data...
      </Row>
    );

  return (
    <Container className="d-flex flex-column justify-content-start align-items-start">
      {/* Page Heading */}
      <Row className="w-100">
        <h3 className={`${styles.label} d-flex align-items-center`}>
          SWTD Points Overview
          <i
            className={`${styles.commentEdit} fa-solid fa-circle-info fa-xs ms-2`}
            onClick={openPointsModal}></i>
        </h3>
        <Modal
          show={showPointsModal}
          onHide={closePointsModal}
          size="lg"
          centered>
          <Modal.Header closeButton>
            <Modal.Title className={styles.formLabel}>
              Required Points & Compliance Schedule
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <SWTDInfo />
          </Modal.Body>
        </Modal>
      </Row>

      {/* Employee Details */}
      <Row className={`${styles.employeeDetails} w-100 mb-2`}>
        <Col className="d-flex align-items-center">
          <Row>
            <Col className="d-flex align-items-center my-1" xs="auto">
              <i className="fa-regular fa-calendar me-2"></i> Term:{" "}
              {terms.length === 0 ? (
                <>No terms were added yet.</>
              ) : (
                <DropdownButton
                  className={`ms-2`}
                  variant={
                    selectedTerm?.is_ongoing === true ? "success" : "secondary"
                  }
                  size="sm"
                  title={selectedTerm ? selectedTerm.name : "All terms"}>
                  <Dropdown.Item onClick={() => setSelectedTerm(null)}>
                    All terms
                  </Dropdown.Item>
                  {terms &&
                    terms.map((term) => (
                      <Dropdown.Item
                        key={term.id}
                        onClick={() => {
                          fetchClearanceStatus(term);
                          setSelectedTerm(term);
                        }}>
                        {term.name}
                      </Dropdown.Item>
                    ))}
                </DropdownButton>
              )}
            </Col>
            <Col className="d-flex align-items-center my-1" xs="auto">
              <i className="fa-solid fa-building me-2"></i>Department:{" "}
              {user?.department}
            </Col>
            {selectedTerm === null && (
              <Col className="d-flex align-items-center my-1" xs="auto">
                <i className="fa-solid fa-circle-plus me-2"></i>Point Balance:{" "}
                {user?.point_balance}
              </Col>
            )}

            {selectedTerm !== null && (
              <Col className="d-flex align-items-center my-1" xs="auto">
                <i className="fa-solid fa-user-check me-2"></i>Status:{" "}
                <span
                  className={`ms-2 text-${
                    termStatus?.is_cleared ? "success" : "danger"
                  }`}>
                  {termStatus?.is_cleared ? "CLEARED" : "PENDING CLEARANCE"}
                </span>
              </Col>
            )}
          </Row>
        </Col>

        {selectedTerm !== null && (
          <>
          <Col className={`${styles.termPoints} d-none d-sm-inline text-end my-1`} md={2}>
            <div>
              <span
                className={`${styles.validPoints} ${
                  termStatus?.points?.valid_points <
                  termStatus?.points?.required_points
                    ? "text-danger"
                    : "text-success"
                }`}>
                {termStatus?.points?.valid_points}
              </span>
              <span className={styles.requiredPoints}>
                {" "}
                / {termStatus?.points?.required_points}
              </span>
            </div>
            <span className={styles.pointsLabel}>points</span>
          </Col>
          <Col className={`${styles.termPoints} d-flex justify-content-center mt-4 mb-3 d-sm-none`} md={2}>
            <div className={`${styles.termPoints} text-end`}>
              <div>
                <span
                  className={`${styles.validPoints} ${
                    termStatus?.points?.valid_points <
                    termStatus?.points?.required_points
                    ? "text-danger"
                    : "text-success"
                  }`}>
                  {termStatus?.points?.valid_points}
                </span>
                <span className={styles.requiredPoints}>
                  {" "}
                  / {termStatus?.points?.required_points}
                </span>
              </div>
              <span className={`${styles.pointsLabel} d-flex justify-content-center`}>points</span>
            </div>
          </Col>
        </>
        )}
      </Row>
      
      <SWTDTable term={selectedTerm} data={userSWTDs} />
    </Container>
  );
};

export default SWTDDashboard;
