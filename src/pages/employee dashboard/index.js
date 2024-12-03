import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, ListGroup, DropdownButton, Dropdown, 
        Modal, Spinner, Card, OverlayTrigger, Tooltip } from "react-bootstrap"; /* prettier-ignore */
import categories from "../../data/categories.json";
import { getClearanceStatus } from "../../api/user";
import { getTerms } from "../../api/admin";
import { getAllSWTDs } from "../../api/swtd";
import { exportSWTDList } from "../../api/export";
import { useSwitch } from "../../hooks/useSwitch";
import SessionUserContext from "../../contexts/SessionUserContext";

import PointsRequirement from "../../common/info/PointsRequirement";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import BtnPrimary from "../../common/buttons/BtnPrimary";
import styles from "./style.module.css";
import { BarGraph } from "../../components/Bar";

const SWTDDashboard = () => {
  const id = Cookies.get("userID");
  const token = Cookies.get("userToken");
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [showModal, openModal, closeModal] = useSwitch();
  const [showPointsModal, openPointsModal, closePointsModal] = useSwitch();

  const [userSWTDs, setUserSWTDs] = useState([]);
  const [terms, setTerms] = useState([]);
  const [pendingSWTDCount, setPendingSWTDCount] = useState(0);
  const [rejectedSWTDCount, setRejectedSWTDCount] = useState(0);
  const [termPoints, setTermPoints] = useState(null);
  const [termClearance, setTermClearance] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departmentTypes, setDepartmentTypes] = useState({
    semester: false,
    midyear: false,
    academic: false,
  });

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const fetchAllSWTDs = async () => {
    await getAllSWTDs(
      {
        author_id: parseInt(id, 10),
        token: token,
      },
      (response) => {
        setUserSWTDs(response.swtd_forms);
        const totalCounts = response.swtd_forms?.reduce(
          (counts, swtd) => {
            counts[swtd.validation_status.toLowerCase()]++;
            return counts;
          },
          { pending: 0, rejected: 0 }
        );

        setPendingSWTDCount(totalCounts?.pending);
        setRejectedSWTDCount(totalCounts?.rejected);
        setLoading(false);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const truncateTitle = (title) => {
    if (title.length > 40) {
      return title.substring(0, 40) + "...";
    }
    return title;
  };

  const fetchTerms = () => {
    getTerms(
      {
        token: token,
      },
      (response) => {
        let filteredTerms = response.terms;
        const validTypes = [
          ...(departmentTypes.semester ? ["SEMESTER"] : []),
          ...(departmentTypes.midyear ? ["MIDYEAR/SUMMER"] : []),
          ...(departmentTypes.academic ? ["ACADEMIC YEAR"] : []),
        ];

        if (validTypes.length > 0) {
          filteredTerms = filteredTerms.filter((term) =>
            validTypes.includes(term.type)
          );
        }

        const ongoingTerm = filteredTerms.find(
          (term) => term.is_ongoing === true
        );

        setTerms(filteredTerms);
        setSelectedTerm(ongoingTerm || filteredTerms[0]);
        fetchAllSWTDs();
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const fetchTermPoints = (term) => {
    getClearanceStatus(
      {
        id: id,
        term_id: term.id,
        token: token,
      },
      (response) => {
        setTermPoints(response);
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
    if (user && user?.department === null) {
      setLoading(false);
      openModal();
    } else if (user && user?.department !== null) {
      setLoading(true);

      const updatedDepartmentTypes = {
        ...departmentTypes,
        semester: user?.department?.use_schoolyear === false,
        midyear: user?.department?.midyear_points > 0,
        academic: user?.department?.use_schoolyear,
      };
      setDepartmentTypes(updatedDepartmentTypes);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [user]);

  useEffect(() => {
    if (departmentTypes.semester || departmentTypes.midyear || departmentTypes.academic) {
      fetchTerms();
    }
  }, [departmentTypes.semester, departmentTypes.midyear, departmentTypes.academic]); /* prettier-ignore */

  useEffect(() => {
    const counts = { pending: 0, rejected: 0 };
    if (selectedTerm) {
      fetchTermPoints(selectedTerm);
      const termData = user?.clearances?.find(
        (clearance) =>
          clearance.term.id === selectedTerm?.id && !clearance.is_deleted
      );

      if (termData) setTermClearance(true);
      else setTermClearance(false);

      userSWTDs?.forEach((swtd) => {
        if (swtd.term?.id === selectedTerm?.id) {
          counts[swtd.validation_status?.toLowerCase()]++;
        }
      });
    } else {
      userSWTDs?.forEach((swtd) => {
        counts[swtd.validation_status?.toLowerCase()]++;
      });
    }
    setPendingSWTDCount(counts?.pending);
    setRejectedSWTDCount(counts?.rejected);
  }, [selectedTerm, userSWTDs]);

  if (loading)
    return (
      <Row
        className={`${styles.loading} d-flex flex-column justify-content-center align-items-center w-100`}
        style={{ height: "100vh" }}>
        <Col></Col>
        <Col className="text-center">
          <div>
            <Spinner animation="border" />
          </div>
          Loading data...
        </Col>
        <Col></Col>
      </Row>
    );

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center">
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
              <PointsRequirement />
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
              title={selectedTerm ? selectedTerm.name : "View All"}>
              <Dropdown.Item onClick={() => setSelectedTerm("")}>
                All Terms
              </Dropdown.Item>
              {terms &&
                terms.map((term) => (
                  <Dropdown.Item
                    key={term.id}
                    onClick={() => {
                      fetchTermPoints(term);
                      setSelectedTerm(term);
                    }}>
                    {term.name}
                  </Dropdown.Item>
                ))}
            </DropdownButton>
          )}
        </Col>
      </Row>

      <Row className={`${styles.employeeDetails} w-100`}>
        <Col className="d-flex align-items-center mb-lg-3 mb-2" md="auto">
          <i className="fa-solid fa-landmark fa-lg me-2"></i>
          <span className={`${styles.userStat}`}>
            {user?.department ? user.department.name : "No department set."}
          </span>
        </Col>

        {selectedTerm && (
          <Col className="d-flex align-items-center mb-3" md="auto">
            <i className="fa-solid fa-user-check fa-lg me-2"></i>Status:
            <span
              className={`ms-2 text-${termClearance ? "success" : "danger"} ${
                styles.userStat
              }`}>
              {termClearance ? "CLEARED" : "PENDING CLEARANCE"}
            </span>
          </Col>
        )}
      </Row>

      {/* BUTTONS */}
      <Row className="w-100 mb-3">
        <Col lg="2" md="3">
          <Row className="mb-1">
            <BtnPrimary
              onClick={() =>
                !user?.department ? openModal() : handleAddRecordClick()
              }>
              <i className="fa-solid fa-file-circle-plus fa-lg me-2"></i>
              Add SWTD
            </BtnPrimary>
          </Row>
          <Row className="mb-lg-0 mb-3">
            <BtnSecondary
              onClick={handlePrint}
              disabled={userSWTDs?.length === 0}>
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
        <Col className="mb-3" lg="3" md="4">
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id="button-tooltip-2" className={styles.cardBody}>
                Unreviewed SWTDs
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
        <Col className="mb-3" lg="3" md="4">
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id="button-tooltip-3" className={styles.cardBody}>
                Reviewed SWTDs that require revision
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
        {selectedTerm && (
          <>
            <Col className={styles.termPoints}>
              <span className="mb-2">Term Pts:</span>
              <span
                className={`${styles.validPoints} ${
                  termPoints?.valid_points < termPoints?.required_points
                    ? "text-danger"
                    : "text-success"
                }`}>
                {userSWTDs
                  ?.filter(
                    (swtd) =>
                      swtd.term?.id === selectedTerm?.id &&
                      swtd?.validation_status === "APPROVED"
                  )
                  .reduce((total, swtd) => total + swtd.points, 0)}
              </span>
            </Col>

            <Col className={styles.termPoints}>
              <span className="mb-2">Required Pts:</span>
              <span className={`${styles.validPoints} `}>
                {selectedTerm?.type === "SEMESTER" ||
                selectedTerm?.type === "ACADEMIC YEAR"
                  ? user?.department?.required_points || "0"
                  : selectedTerm?.type === "MIDYEAR/SUMMER"
                  ? user?.department?.midyear_points || "0"
                  : "0"}
              </span>
            </Col>
          </>
        )}
        <Col
          className={`text-${!selectedTerm ? "end" : ""} ${styles.termPoints}`}>
          <span className="mb-2">Excess Pts:</span>
          <span className={`${styles.validPoints} `}>
            {user?.point_balance}
          </span>
        </Col>
      </Row>

      {/* GRAPHS */}
      <Row className="w-100 mb-4">
        {userSWTDs?.length > 0 ? (
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
                  <Col
                    className={`${styles.employeeDetails} pe-0`}
                    md="auto"
                    xs={1}>
                    {category.id}
                  </Col>
                  <Col className={styles.cardBody} md={11} xs={11}>
                    {category.name}
                  </Col>
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

      {userSWTDs?.length !== 0 && (
        <>
          <Row className="w-100 mb-2">
            <hr />
          </Row>
          <Row className="w-100 mb-3">
            <Col className={styles.formLabel}>
              <h3 className={`${styles.label} d-flex align-items-center`}>
                My SWTD submissions
              </h3>
              <span className={styles.userStat} style={{ color: "#9d084a" }}>
                {
                  userSWTDs?.filter(
                    (item) =>
                      !selectedTerm || item.term?.id === selectedTerm?.id
                  ).length
                }
              </span>{" "}
              Total SWTDs for {selectedTerm ? selectedTerm.name : "All Terms"}
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
                  <Col lg={5} md={5} xs={isMobile ? 6 : 4}>
                    Title
                  </Col>
                  {!isMobile && (
                    <Col lg={4} md={4} xs={2}>
                      Category
                    </Col>
                  )}
                  <Col lg={2} md={2} xs={isMobile ? 4 : 2}>
                    Status
                  </Col>
                  <Col className="text-center" lg={1} md={1} xs={2}>
                    Points
                  </Col>
                </Row>
              </ListGroup.Item>
            </ListGroup>
            <ListGroup>
              {userSWTDs
                ?.filter(
                  (item) => !selectedTerm || item.term?.id === selectedTerm?.id
                )
                .slice(-5)
                .reverse()
                .map((item) => (
                  <ListGroup.Item
                    key={item.id}
                    className={styles.tableBody}
                    onClick={() => handleViewSWTD(item.id)}>
                    <Row>
                      <Col lg={5} md={5} xs={isMobile ? 6 : 4}>
                        {truncateTitle(item.title)}
                      </Col>
                      {!isMobile && (
                        <Col lg={4} md={4} xs={2}>
                          {truncateTitle(item.category)}
                        </Col>
                      )}
                      <Col lg={2} md={2} xs={isMobile ? 4 : 2}>
                        {item.validation_status === "REJECTED"
                          ? "FOR REVISION"
                          : item.validation_status}
                      </Col>
                      <Col className="text-center" lg={1} md={1} xs={2}>
                        {item.points}
                      </Col>
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
