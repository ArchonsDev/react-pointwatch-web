import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup, DropdownButton, Dropdown, Modal, Spinner} from "react-bootstrap"; /* prettier-ignore */

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

// Custom Components
import SWTDTable from "../../components/SWTDTable";

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

  const [displayContent, setDisplayContent] = useState([]);

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

  const handleAddRecordClick = () => {
    navigate("/swtd/form");
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

  // Term/Status/Search side effect
  useEffect(() => {
    var content = userSWTDs;

    if (selectedTerm !== null) {
      content = content.filter((swtd) => swtd?.term.id === selectedTerm?.id);
    }

    if (selectedStatus !== "") {
      content = content.filter((swtd) => swtd.validation.status.toLowerCase() === selectedStatus.toLowerCase());
    }

    if (searchQuery !== "") {
      var query = searchQuery.toLowerCase();

      content = content.filter(
        (swtd) => (
          swtd.id.toString().includes(query) ||
          swtd.title.toLowerCase().includes(query) ||
          swtd.points.toString().includes(query)
        )
      );
    }

    setDisplayContent(content);
  }, [selectedTerm, selectedStatus, searchQuery, userSWTDs]);

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
          <Col className={`${styles.termPoints} d-flex justify-content-center mt-4 d-sm-none`} md={2}>
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
      
      {/* Table Controls */}
      <Row className="w-100 d-flex align-items-center mx-0 px-0">
        {/* Search Bar */}
        <Col xs="12" sm="7" md="4" xxl="4" className="text-start mb-3 px-0">
          <InputGroup className={`${styles.searchBar}`}>
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

        {/* Status Filter */}
        <Col xs="6" sm="6" md="3" xxl="3" className="d-flex align-items-center px-4 me-auto mb-3">
          <Form.Group as={Row} controlId="inputFilter" className="flex-grow-1">
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
          </Form.Group>
        </Col>

        {/* Action Buttons -> Larger than Mobile */}
        <Col xs="6" sm="5" mb="3" xxl="4" className="d-none d-sm-flex justify-content-end mb-3 px-0">
          <Row className="w-100 d-flex justify-content-end align-items-center">
            <Col sm="5" className="d-flex justify-content-end">
              {selectedTerm === null && <BtnSecondary onClick={handlePrint}>Export PDF</BtnSecondary>}
            </Col>
            <Col sm="6" className="d-flex justify-content-end">
              <BtnPrimary onClick={() =>user?.department === null ? openModal() : handleAddRecordClick()}>Add a New Record</BtnPrimary>
            </Col>
          </Row>
        </Col>

        {/* Action Buttons -> Mobile */}
        <Col xs="6" className="d-sm-none d-flex justify-content-between mb-3">
          {selectedTerm === null && (
            <BtnSecondary onClick={handlePrint}><i class="fa-solid fa-download"></i></BtnSecondary>
          )}
          <BtnPrimary
            onClick={() =>
              user?.department === null ? openModal() : handleAddRecordClick()
            }>
            <i class="fa-solid fa-plus"></i>
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

      <Row className="w-100 mx-0 px-0 mb-3">
        <Col xs="12" className="mx-0 px-0">
          <SWTDTable data={displayContent} />
        </Col>
      </Row>
    </Container>
  );
};

export default SWTDDashboard;
