import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, ListGroup, DropdownButton, Dropdown, Modal, Spinner, Card, OverlayTrigger, Tooltip } from "react-bootstrap"; /* prettier-ignore */

import departmentTypes from "../../data/departmentTypes.json";
import categories from "../../data/categories.json";
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
import { BarGraph } from "../../components/Bar";

const SWTDDashboard = () => {
  const id = Cookies.get("userID");
  const token = Cookies.get("userToken");
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();

  const [showModal, openModal, closeModal] = useSwitch();
  const [showPointsModal, openPointsModal, closePointsModal] = useSwitch();

  const [userSWTDs, setUserSWTDs] = useState([]);
  const [terms, setTerms] = useState([]);
  const [pendingSWTDCount, setPendingSWTDCount] = useState(0);
  const [rejectedSWTDCount, setRejectedSWTDCount] = useState(0);

  const [termStatus, setTermStatus] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAllSWTDs = async () => {
    await getAllSWTDs(
      {
        author_id: id,
        token: token,
      },
      (response) => {
        setUserSWTDs(response.swtds);
        const totalCounts = response.swtds.reduce(
          (counts, swtd) => {
            counts[swtd.validation.status.toLowerCase()]++;
            return counts;
          },
          { pending: 0, rejected: 0 }
        );

        // Update the state with the counts
        setPendingSWTDCount(totalCounts.pending);
        setRejectedSWTDCount(totalCounts.rejected);
        setLoading(false);
      },
      (error) => {
        console.log(error);
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
    const allowedTerm = departmentTypes[user?.department?.classification];
    getTerms(
      {
        token: token,
      },
      (response) => {
        const filteredTerms = response.terms.filter((term) =>
          allowedTerm.includes(term.type)
        );

        const ongoingTerm = filteredTerms.find(
          (term) => term.is_ongoing === true
        );

        setTerms(filteredTerms);
        setSelectedTerm(ongoingTerm || filteredTerms[0]);
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

  const handleViewSWTD = (id) => {
    navigate(`/swtd/all/${id}`);
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

  useEffect(() => {
    if (selectedTerm) {
      fetchClearanceStatus(selectedTerm);
      const termCounts = userSWTDs?.reduce(
        (counts, swtd) => {
          if (swtd.term.id === selectedTerm.id) {
            counts[swtd.validation.status.toLowerCase()]++;
          }
          return counts;
        },
        { pending: 0, rejected: 0 }
      );

      setPendingSWTDCount(termCounts.pending);
      setRejectedSWTDCount(termCounts.rejected);
    }
  }, [selectedTerm, userSWTDs]);

  useEffect(() => {
    if (!user) setLoading(true);
    else if (!user?.department) {
      setLoading(false);
      openModal();
    } else {
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
      <Row className="w-100 mb-1">
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
          <i className="fa-regular fa-calendar fa-lg me-2"></i> Term:{" "}
          {terms.length === 0 ? (
            <>No terms were added yet.</>
          ) : (
            <DropdownButton
              className={`ms-2`}
              variant={
                selectedTerm?.is_ongoing === true ? "success" : "secondary"
              }
              size="sm"
              title={selectedTerm?.name}>
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
        <Col className="d-flex align-items-center" md="auto">
          <i className="fa-solid fa-landmark fa-lg me-2"></i>Department:
          <span className={`${styles.userStat} ms-2`}>
            {user?.department?.name}
          </span>
        </Col>

        {selectedTerm !== null && (
          <Col className="d-flex align-items-center" md="auto">
            <i className="fa-solid fa-user-check fa-lg me-2"></i>Status:
            <span
              className={`ms-2 text-${
                termStatus?.is_cleared ? "success" : "danger"
              } ${styles.userStat}`}>
              {termStatus?.is_cleared ? "CLEARED" : "PENDING CLEARANCE"}
            </span>
          </Col>
        )}
      </Row>

      <Row className="w-100 mb-3">
        {/* BUTTONS */}
        <Col md="2">
          <Row className="mb-1">
            <BtnPrimary
              onClick={() =>
                !user?.department ? openModal() : handleAddRecordClick()
              }>
              <i className="fa-solid fa-file-circle-plus fa-lg me-2"></i>
              Add SWTD
            </BtnPrimary>
          </Row>
          <Row>
            <BtnSecondary
              onClick={handlePrint}
              disabled={userSWTDs.length === 0}>
              <i className="fa-solid fa-file-arrow-down fa-lg me-2"></i>
              Export PDF
            </BtnSecondary>
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

        {/* PENDING SWTDs Card */}
        <Col md="3">
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id="button-tooltip-2" className={styles.cardBody}>
                Unreviewed SWTDs by your department head.
              </Tooltip>
            }>
            <Card className={`${styles.statCard} text-center`}>
              <Card.Header className={styles.pendingStat}>
                <i className="fa-solid fa-hourglass-half me-2"></i>
                Pending SWTDs
              </Card.Header>
              <Card.Body className={styles.statBody}>
                <Card.Text>{pendingSWTDCount}</Card.Text>
              </Card.Body>
            </Card>
          </OverlayTrigger>
        </Col>

        {/* REJECTED SWTDs Card */}
        <Col md="3">
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id="button-tooltip-3" className={styles.cardBody}>
                Reviewed SWTDs that require revision.
              </Tooltip>
            }>
            <Card className={`${styles.statCard} text-center`}>
              <Card.Header className={styles.rejectedStat}>
                <i className="fa-solid fa-file-pen me-2"></i>
                SWTDs For Revision
              </Card.Header>
              <Card.Body className={styles.statBody}>
                <Card.Text>{rejectedSWTDCount}</Card.Text>
              </Card.Body>
            </Card>
          </OverlayTrigger>
        </Col>

        {/* POINTS */}
        <Col>
          {selectedTerm !== null && (
            <div className={styles.termPoints}>
              <span className="mb-2">Points for this term:</span>
              <span
                className={`${styles.validPoints} ${
                  termStatus?.points?.valid_points <
                  termStatus?.points?.required_points
                    ? "text-danger"
                    : "text-success"
                }`}>
                {termStatus?.points?.valid_points > 0
                  ? termStatus.points.valid_points
                  : "0"}{" "}
                pts
              </span>
            </div>
          )}
        </Col>

        <Col>
          {selectedTerm !== null && (
            <div className={styles.termPoints}>
              <span className="mb-2">Excess points:</span>
              <span className={`${styles.validPoints} `}>
                {user?.point_balance} pts
              </span>
            </div>
          )}
        </Col>
      </Row>

      <Row className="w-100 mb-4">
        {userSWTDs.length > 0 ? (
          <>
            <Col
              className={`${styles.graphBackground} d-flex justify-content-center align-items-center me-2`}>
              <BarGraph swtd={userSWTDs} term={selectedTerm} />
            </Col>

            <Col className="p-2">
              <span className={`${styles.points}`}>
                Legend (Category ID - Name)
                <hr className="m-0 mb-2" />
              </span>
              {categories.categories.map((category) => (
                <Row className={`mt-1`} key={category.id}>
                  <Col className={`${styles.employeeDetails} pe-0`} md="auto">
                    {category.id}
                  </Col>
                  <Col className={styles.cardBody}>{category.name}</Col>
                </Row>
              ))}
            </Col>
          </>
        ) : (
          <Col className={`${styles.employeeDetails} text-center`}>
            <hr className="mb-4" />
            <h5>No statistics to show yet.</h5>
          </Col>
        )}
      </Row>

      {userSWTDs.length !== 0 && (
        <>
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
              <BtnSecondary onClick={() => navigate("/swtd/all")}>
                View All
              </BtnSecondary>
            </Col>
          </Row>
          <Row className="w-100 mb-3">
            <ListGroup className="w-100" variant="flush">
              <ListGroup.Item className={styles.swtdHeader}>
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
                    onClick={() => handleViewSWTD(item.id)}>
                    <Row>
                      <Col md={9}>{truncateTitle(item.title)}</Col>
                      <Col md={2}>
                        {item.validation.status === "REJECTED"
                          ? "FOR REVISION"
                          : item.validation.status}
                      </Col>
                      <Col md={1}>{item.points}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
            </ListGroup>
          </Row>
        </>
      )}
    </Container>
  );
};

export default SWTDDashboard;
