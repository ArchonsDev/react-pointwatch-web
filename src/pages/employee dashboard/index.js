import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup, DropdownButton, Dropdown, Modal } from "react-bootstrap"; /* prettier-ignore */

import departmentTypes from "../../data/departmentTypes.json";
import { getClearanceStatus } from "../../api/user";
import { getTerms } from "../../api/admin";
import { getAllSWTDs } from "../../api/swtd";
import { exportSWTDList } from "../../api/export";
import { useSwitch } from "../../hooks/useSwitch";
import SessionUserContext from "../../contexts/SessionUserContext";

import SWTDInfo from "./SWTDInfo";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import BtnPrimary from "../../common/buttons/BtnPrimary";
import styles from "./style.module.css";

const SWTDDashboard = () => {
  const id = Cookies.get("userID");
  const token = Cookies.get("userToken");
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();

  const [showModal, openModal, closeModal] = useSwitch();
  const [showPointsModal, openPointsModal, closePointsModal] = useSwitch();

  const [userSWTDs, setUserSWTDs] = useState([]);
  const [terms, setTerms] = useState([]);

  const [termStatus, setTermStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAllSWTDs = async () => {
    await getAllSWTDs(
      {
        author_id: id,
        token: token,
      },
      (response) => {
        setUserSWTDs(response.swtds);
      },
      (error) => {
        if (error.response && error.response.data) {
          console.log(error.response.data.error);
        }
      }
    );
  };

  const truncateTitle = (title) => {
    if (title.length > 50) {
      return title.substring(0, 50) + "...";
    }
    return title;
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

  const handleAddRecordClick = () => {
    navigate("/swtd/form");
  };

  const handleEditRecordClick = (id) => {
    navigate(`/swtd/${id}`);
  };

  const handlePrint = () => {
    exportSWTDList(
      {
        id: id,
        token: token,
      },
      (response) => {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const blobURL = URL.createObjectURL(blob);
        window.open(blobURL, "_blank");
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const filteredSWTDs = userSWTDs?.filter(
    (swtd) => swtd?.term.id === selectedTerm?.id
  );

  const displayedSWTDs = (selectedTerm ? filteredSWTDs : userSWTDs)?.filter(
    (swtd) =>
      (selectedStatus === "" || swtd.validation.status === selectedStatus) &&
      (swtd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        swtd.validation.status
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      setLoading(false);
      fetchTerms();
      fetchAllSWTDs();
    }
  }, []);

  if (loading) return null;

  return (
    <Container className="d-flex flex-column justify-content-start align-items-start">
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

      <Row className={`${styles.employeeDetails} w-100 mb-3`}>
        <Col className="d-flex align-items-center">
          <Row>
            <Col className="d-flex align-items-center" xs="auto">
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
            <Col className="d-flex align-items-center" xs="auto">
              <i className="fa-solid fa-building me-2"></i>Department:{" "}
              {user?.department}
            </Col>
            {selectedTerm === null && (
              <Col className="d-flex align-items-center" xs="auto">
                <i className="fa-solid fa-circle-plus me-2"></i>Point Balance:{" "}
                {user?.point_balance}
              </Col>
            )}
            {/* {selectedTerm && (
              <Col className="d-flex align-items-center" xs="auto">
                <i className="fa-solid fa-circle-plus me-2"></i>Term Points:{" "}
                <span
                  className={`ms-1 ${
                    termStatus?.points?.valid_points <
                    termStatus?.points?.required_points
                      ? "text-danger"
                      : "text-success"
                  }`}>
                  {termStatus?.points?.valid_points} /{" "}
                  {termStatus?.points?.required_points}
                </span>
              </Col>
            )} */}
            {selectedTerm !== null && (
              <Col className="d-flex align-items-center" xs="auto">
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
          <Col className={`${styles.termPoints} text-end`} md={2}>
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
        )}
      </Row>

      <Row className="w-100">
        <Col className="text-start" md={5}>
          <InputGroup className={`${styles.searchBar} mb-3`}>
            <InputGroup.Text>
              <i className="fa-solid fa-magnifying-glass"></i>
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col>
          <Form.Group as={Row} controlId="inputFilter">
            <Form.Label className={styles.filterText} column sm="2">
              Status
            </Form.Label>
            <Col sm="8">
              <Form.Select
                className={styles.cardBody}
                name="filter"
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                }}>
                <option value="">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </Form.Select>
            </Col>
          </Form.Group>
        </Col>

        <Col className="text-end">
          {selectedTerm === null && (
            <BtnSecondary onClick={handlePrint}>Export PDF</BtnSecondary>
          )}{" "}
          <BtnPrimary
            onClick={() =>
              user?.department === null ? openModal() : handleAddRecordClick()
            }>
            Add a New Record
          </BtnPrimary>
        </Col>

        <Modal show={showModal} onHide={closeModal} size="md" centered>
          <Modal.Header closeButton>
            <Modal.Title className={styles.formLabel}>
              Missing Required Fields
            </Modal.Title>
          </Modal.Header>
          <Modal.Body
            className={`${styles.filterText} d-flex justify-content-center align-items-center`}>
            Department is required before adding a new record. Please proceed to
            your settings to make this change.
          </Modal.Body>
          <Modal.Footer>
            <BtnPrimary onClick={() => navigate("/settings")}>
              Go to Settings
            </BtnPrimary>
          </Modal.Footer>
        </Modal>
      </Row>

      <Row className="w-100">
        {selectedTerm === null ? (
          <>
            <ListGroup className="w-100" variant="flush">
              {userSWTDs.length === 0 ? (
                <span
                  className={`${styles.msg} d-flex justify-content-center align-items-center mt-5 w-100`}>
                  No records submitted.
                </span>
              ) : (
                <ListGroup.Item className={styles.tableHeader}>
                  <Row>
                    <Col xs={1}>No.</Col>
                    <Col xs={7}>Title of SWTD</Col>
                    <Col xs={2}>Points</Col>
                    <Col xs={2}>Status</Col>
                  </Row>
                </ListGroup.Item>
              )}
            </ListGroup>
            <ListGroup>
              {displayedSWTDs.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  className={styles.tableBody}
                  onClick={() => handleEditRecordClick(item.id)}>
                  <Row>
                    <Col xs={1}>{item.id}</Col>
                    <Col xs={7}>{truncateTitle(item.title)}</Col>
                    <Col xs={2}>{item.points}</Col>
                    <Col xs={2}>{item.validation.status}</Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        ) : displayedSWTDs.length === 0 ? (
          <span
            className={`${styles.msg} d-flex justify-content-center align-items-center mt-5 w-100`}>
            No records found.
          </span>
        ) : (
          <>
            <ListGroup className="w-100" variant="flush">
              <ListGroup.Item className={styles.tableHeader}>
                <Row>
                  <Col xs={1}>No.</Col>
                  <Col xs={7}>Title of SWTD</Col>
                  <Col xs={2}>Points</Col>
                  <Col xs={2}>Status</Col>
                </Row>
              </ListGroup.Item>
            </ListGroup>
            <ListGroup>
              {displayedSWTDs.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  className={styles.tableBody}
                  onClick={() => handleEditRecordClick(item.id)}>
                  <Row>
                    <Col xs={1}>{item.id}</Col>
                    <Col xs={7}>{truncateTitle(item.title)}</Col>
                    <Col xs={2}>{item.points}</Col>
                    <Col xs={2}>{item.validation.status}</Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
      </Row>
    </Container>
  );
};

export default SWTDDashboard;
