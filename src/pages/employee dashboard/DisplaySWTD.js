import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, Form, InputGroup, ListGroup, Spinner, Dropdown, DropdownButton, Modal } from "react-bootstrap"; /* prettier-ignore */

import status from "../../data/status.json";
import { getAllSWTDs } from "../../api/swtd";
import { getTerms } from "../../api/admin";
import { exportSWTDList } from "../../api/export";
import { useSwitch } from "../../hooks/useSwitch";
import SessionUserContext from "../../contexts/SessionUserContext";

import PaginationComponent from "../../components/Paging";
import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import styles from "./style.module.css";

const SWTDDashboard = () => {
  const id = Cookies.get("userID");
  const token = Cookies.get("userToken");
  const { user } = useContext(SessionUserContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  const [showModal, openModal, closeModal] = useSwitch();
  const [userSWTDs, setUserSWTDs] = useState([]);
  const [terms, setTerms] = useState([]);
  const [departmentTypes, setDepartmentTypes] = useState({
    semester: false,
    midyear: false,
    academic: false,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const fetchAllSWTDs = async () => {
    await getAllSWTDs(
      {
        author_id: id,
        token: token,
      },
      (response) => {
        setUserSWTDs(response.swtd_forms);
      },
      (error) => {
        if (error.response && error.response.data) {
          console.log(error.response.data.error);
        }
      }
    );
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
        setLoading(false);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const truncateTitle = (title) => {
    if (title.length > 40) {
      return title.substring(0, 40) + "...";
    }
    return title;
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilter = (swtdList, query, stat) => {
    return swtdList.filter((swtd) => {
      const matchesQuery = swtd.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStat = stat ? swtd.validation_status === stat : true;
      return matchesQuery && matchesStat;
    });
  };

  // SWTDs with selected term
  const termSWTDs = userSWTDs?.filter(
    (swtd) => swtd?.term.id === selectedTerm?.id
  );

  //If term is selected, use termSWTDs. Else, use default SWTDs.
  const swtds = selectedTerm ? termSWTDs : userSWTDs;

  //Filtered SWTDs with search bar
  const filteredSWTDs = handleFilter(swtds, searchQuery, selectedStatus);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  // Calculate pagination
  const totalRecords = filteredSWTDs.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSWTDs.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  useEffect(() => {
    if (user && user?.department !== null) {
      setDepartmentTypes({
        ...departmentTypes,
        semester: user?.department?.use_schoolyear === false ? true : false,
        midyear: user?.department?.midyear_points > 0 ? true : false,
        academic: user?.department?.use_schoolyear,
      });
      fetchAllSWTDs();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    } else {
      setLoading(true);
    }
  }, [user]);

  useEffect(() => {
    if (departmentTypes) fetchTerms();
  }, [departmentTypes]);

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
      <Row className="w-100 mb-2">
        <Col className="p-0">
          <h3 className={styles.label}>
            <i
              className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
              onClick={() => navigate("/swtd")}></i>{" "}
            SWTD Submissions
          </h3>
        </Col>

        <Col
          className={`d-flex align-items-center mb-3 ${styles.employeeDetails}`}
          xs="auto">
          <i className="fa-regular fa-calendar me-2"></i> Term:{" "}
          {terms.length === 0 ? (
            <>No terms were added yet.</>
          ) : (
            <DropdownButton
              className={`${styles.defaultItem} ms-2`}
              variant={
                selectedTerm?.is_ongoing === true ? "success" : "secondary"
              }
              size="sm"
              title={selectedTerm ? selectedTerm?.name : "All Terms"}>
              <Dropdown.Item
                onClick={() => {
                  setSelectedTerm("");
                }}>
                All Terms
              </Dropdown.Item>
              {terms &&
                terms.map((term) => (
                  <Dropdown.Item
                    key={term.id}
                    onClick={() => {
                      setSelectedTerm(term);
                    }}>
                    {term.name}
                  </Dropdown.Item>
                ))}
            </DropdownButton>
          )}
        </Col>
      </Row>

      <Row className="w-100">
        <Col className="text-start p-0 me-2" md={6} xs={12}>
          <InputGroup className={`${styles.searchBar} mb-3`}>
            <InputGroup.Text>
              <i className="fa-solid fa-magnifying-glass"></i>
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Search by SWTD title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col
          className={`${styles.cardBody} p-0 mb-3 me-3 me-lg-5`}
          lg="auto"
          md="auto"
          xs={12}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fa-solid fa-tags fa-lg"></i>
            </InputGroup.Text>
            <Form.Select
              name="filter"
              onChange={(e) => {
                setSelectedStatus(e.target.value);
              }}>
              <option value="">All Statuses</option>
              {status.status.map((status, index) => (
                <option key={index} value={status}>
                  {status === "REJECTED" ? "FOR REVISION" : status}
                </option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>

        <Col
          className="text-end ms-lg-5 ms-0 mb-2 me-2"
          lg="auto"
          md="auto"
          xs={12}>
          <Row>
            <BtnPrimary
              onClick={() =>
                !user?.department ? openModal() : navigate("/swtd/form")
              }>
              <i className="fa-solid fa-file-circle-plus fa-lg me-2"></i>
              Add SWTD
            </BtnPrimary>
          </Row>
        </Col>

        <Col className="text-end mb-3" lg="auto" md="auto" xs={12}>
          <Row>
            <BtnSecondary
              onClick={handlePrint}
              disabled={userSWTDs.length === 0}>
              <i className="fa-solid fa-file-arrow-down fa-lg me-2"></i>
              Export PDF
            </BtnSecondary>
          </Row>
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

      {currentRecords.length !== 0 ? (
        <>
          <Row className="w-100 mb-3">
            <ListGroup className="w-100" variant="flush">
              <ListGroup.Item className={styles.swtdHeader}>
                <Row>
                  <Col lg={5} md={5} xs={isMobile ? 6 : 4}>
                    Title
                  </Col>
                  {!isMobile && (
                    <Col lg={4} md={4}>
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
              {currentRecords
                .filter(
                  (item) => !selectedTerm || item.term?.id === selectedTerm?.id
                )
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
                        <Col lg={4} md={4}>
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
          <Row className="w-100 mb-3">
            <Col className="d-flex justify-content-center">
              <PaginationComponent
                totalPages={totalPages}
                currentPage={currentPage}
                handlePageChange={handlePageChange}
              />
            </Col>
          </Row>
        </>
      ) : (
        <>
          <Row className="w-100">
            <hr />
          </Row>
          <Row className="w-100">
            <Col className={`${styles.employeeDetails} text-center`}>
              No submissions found.
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default SWTDDashboard;
