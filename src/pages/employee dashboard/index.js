import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup, DropdownButton, Dropdown, Modal, Spinner, Card, ProgressBar } from "react-bootstrap"; /* prettier-ignore */

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
import { LineGraph } from "../../components/Line";
import { ProgBars } from "../../components/ProgressBar";

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
        setLoading(false);
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

  // const displayedSWTDs = (selectedTerm ? filteredSWTDs : userSWTDs)?.filter(
  //   (swtd) =>
  //     (selectedStatus === "" || swtd.validation.status === selectedStatus) &&
  //     (swtd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       swtd.validation.status
  //         .toLowerCase()
  //         .includes(searchQuery.toLowerCase()))
  // );

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
      <Row className="w-100 mb-3">
        <Col>
          <h3 className={`${styles.label} d-flex align-items-center`}>
            Dashboard
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
        </Col>
        <Col
          className={`d-flex align-items-center ${styles.employeeDetails}`}
          xs="auto">
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
      </Row>

      <Row className={`${styles.employeeDetails} w-100 mb-3`}>
        <Col className="d-flex align-items-center">
          <Row>
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
      </Row>

      <Row className="w-100 mb-3">
        {/* BUTTONS */}
        <Col md="auto">
          <Row className="mb-1">
            <BtnPrimary
              onClick={() =>
                user?.department === null ? openModal() : handleAddRecordClick()
              }>
              Add SWTD
            </BtnPrimary>
          </Row>
          <Row>
            <BtnSecondary onClick={handlePrint}>Export PDF</BtnSecondary>
          </Row>
          <Modal show={showModal} onHide={closeModal} size="md" centered>
            <Modal.Header closeButton>
              <Modal.Title className={styles.formLabel}>
                Missing Required Fields
              </Modal.Title>
            </Modal.Header>
            <Modal.Body
              className={`${styles.filterText} d-flex justify-content-center align-items-center`}>
              Department is required before adding a new record. Please proceed
              to your settings to make this change.
            </Modal.Body>
            <Modal.Footer>
              <BtnPrimary onClick={() => navigate("/settings")}>
                Go to Settings
              </BtnPrimary>
            </Modal.Footer>
          </Modal>
        </Col>

        <Col>
          <Card className={`${styles.statCard} text-center`}>
            <Card.Header className={styles.statHeader}>
              Approved SWTDs
            </Card.Header>
            <Card.Body className={styles.statBody}>
              <Card.Text>4</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className={`${styles.statCard} text-center`}>
            <Card.Header className={styles.statHeader}>
              Pending SWTDs
            </Card.Header>
            <Card.Body className={styles.statBody}>
              <Card.Text>2</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className={`${styles.statCard} text-center`}>
            <Card.Header className={styles.statHeader}>
              SWTDs for Revision
            </Card.Header>
            <Card.Body className={styles.statBody}>
              <Card.Text>4</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className={`${styles.statCard} text-center`}>
            <Card.Header className={styles.statHeader}>Total SWTDs</Card.Header>
            <Card.Body className={styles.statBody}>
              <Card.Text>10</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* POINTS */}
        <Col className="d-flex align-items-center" md="auto">
          {selectedTerm !== null && (
            <>
              <div className={styles.termPoints}>
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
                  / {termStatus?.points?.required_points} points
                </span>
              </div>
            </>
          )}
        </Col>
      </Row>

      <Row className="w-100 mb-3">
        <hr />
      </Row>

      <Row className="w-100 mb-3">
        <Col className={styles.graphBackground}>
          <LineGraph swtd={userSWTDs} term={selectedTerm} />
        </Col>

        <Col>
          <ProgBars swtd={userSWTDs} term={selectedTerm} />
        </Col>
      </Row>

      <Row className="w-100 mb-3">
        <hr />
      </Row>

      <Row className="w-100 mb-3">
        <Col>
          <h3 className={`${styles.label} d-flex align-items-center`}>
            Recent SWTDs
          </h3>
        </Col>
        <Col className="text-end">
        <BtnSecondary onClick={() => navigate("/swtd/all")}>View All</BtnSecondary>
        </Col>
      </Row>

      <Row className="w-100 mb-3">
        <ListGroup className="w-100" variant="flush">
          <ListGroup.Item className={styles.tableHeader}>
            <Row>
              <Col md={9}>Title</Col>
              <Col md={2}>Status</Col>
              <Col md={1}>Points</Col>
            </Row>
          </ListGroup.Item>
        </ListGroup>
        <ListGroup>
          {userSWTDs
            .slice(-5)
            .reverse()
            .map((item) => (
              <ListGroup.Item
                key={item.id}
                className={styles.tableBody}
                onClick={() => handleEditRecordClick(item.id)}>
                <Row>
                  <Col md={9}>{truncateTitle(item.title)}</Col>
                  <Col md={2}>{item.validation.status}</Col>
                  <Col md={1}>{item.points}</Col>
                </Row>
              </ListGroup.Item>
            ))}
        </ListGroup>
      </Row>
    </Container>
  );
};

export default SWTDDashboard;
