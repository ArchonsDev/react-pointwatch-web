import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup, DropdownButton, Dropdown, Modal, Spinner, Pagination } from "react-bootstrap"; /* prettier-ignore */

import departmentTypes from "../../data/departmentTypes.json";
import status from "../../data/status.json";
import { getTerms, clearEmployee, revokeEmployee } from "../../api/admin";
import { getAllSWTDs } from "../../api/swtd";
import { getUser, getClearanceStatus } from "../../api/user";
import { exportSWTDList } from "../../api/export";
import { useSwitch } from "../../hooks/useSwitch";
import SessionUserContext from "../../contexts/SessionUserContext";

import SWTDInfo from "../employee dashboard/SWTDInfo";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import styles from "./style.module.css";

const EmployeeSWTD = () => {
  const { user } = useContext(SessionUserContext);
  const { id } = useParams();
  const token = Cookies.get("userToken");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userSWTDs, setUserSWTDs] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [termStatus, setTermStatus] = useState(null);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, openModal, closeModal] = useSwitch();
  const [showRevokeModal, openRevokeModal, closeRevokeModal] = useSwitch();
  const [showPointsModal, openPointsModal, closePointsModal] = useSwitch();
  const recordsPerPage = 15;

  const fetchUser = async () => {
    await getUser(
      {
        id: id,
        token: token,
      },
      (response) => {
        setEmployee(response.data);
        fetchTerms(response.data.department);
        fetchAllSWTDs(response.data.id);
      },
      (error) => {
        console.log(error.response);
      }
    );
  };

  const fetchAllSWTDs = (empID) => {
    getAllSWTDs(
      {
        author_id: empID,
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

  const fetchTerms = (dept) => {
    const allowedTerm = departmentTypes[dept];
    getTerms(
      {
        token: token,
      },
      (response) => {
        const filteredTerms = response.terms.filter((term) =>
          allowedTerm.includes(term?.type)
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

  const handleViewSWTD = (swtd_id) => {
    navigate(`/dashboard/${id}/${swtd_id}`);
  };

  const handleClear = (term) => {
    clearEmployee(
      {
        id: id,
        term_id: term.id,
        token: token,
      },
      (response) => {
        fetchClearanceStatus(term);
        fetchUser();
      }
    );
  };

  const handleRevoke = (term) => {
    revokeEmployee(
      {
        id: id,
        term_id: term.id,
        token: token,
      },
      (response) => {
        fetchClearanceStatus(term);
        fetchUser();
      }
    );
  };

  const truncateTitle = (title) => {
    if (title.length > 50) {
      return title.substring(0, 50) + "...";
    }
    return title;
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

  const pageTitle = employee
    ? `${employee.firstname} ${employee.lastname}'s SWTDs`
    : "SWTDs";

  const handleFilter = (swtdList, query, stat) => {
    return swtdList.filter((swtd) => {
      const matchesQuery = swtd.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStat = stat ? swtd.validation.status === stat : true;
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

  // Calculate pagination
  const totalRecords = filteredSWTDs.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSWTDs.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (selectedTerm) fetchClearanceStatus(selectedTerm);
  }, [selectedTerm]);

  useEffect(() => {
    if (!user) setLoading(true);
    else {
      if (!user?.is_admin && !user?.is_staff && !user?.is_superuser)
        navigate("/swtd");
      else {
        fetchUser();
      }
    }
  }, [user, navigate]);

  if (loading)
    return (
      <Row
        className={`${styles.msg} d-flex justify-content-center align-items-center w-100`}>
        <Spinner className={`me-2`} animation="border" />
        Loading data...
      </Row>
    );

  return (
    <Container className="d-flex flex-column justify-content-start align-items-start">
      <Row className="mb-2">
        <h3 className={styles.label}>
          <i
            className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
            onClick={() => navigate("/dashboard")}></i>{" "}
          {pageTitle}
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

            <Col className="d-flex align-items-center" xs="auto">
              <i className="fa-solid fa-circle-plus me-2"></i>Point Balance:{" "}
              {employee?.point_balance}
            </Col>

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
        {/* SEARCH BAR */}
        <Col className="text-start p-0 me-2" md={5}>
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

        {/* STATUS FILTER */}
        <Col className={styles.filterOption} md="auto">
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

        {/* CLEARANCE BUTTONS */}
        <Col className="text-end">
          {user?.is_admin &&
            selectedTerm !== null &&
            (termStatus?.is_cleared ? (
              <>
                <BtnSecondary onClick={openRevokeModal}>
                  Revoke Clearance
                </BtnSecondary>{" "}
              </>
            ) : (
              <>
                <BtnPrimary
                  onClick={openModal}
                  disabled={
                    termStatus?.points?.valid_points + employee?.point_balance <
                    termStatus?.points?.required_points
                  }>
                  Grant Clearance
                </BtnPrimary>{" "}
              </>
            ))}
          {selectedTerm === null && (
            <BtnSecondary
              onClick={handlePrint}
              disabled={loading || userSWTDs.length === 0}>
              <i className="fa-solid fa-file-arrow-down me-2"></i>
              Export PDF
            </BtnSecondary>
          )}
        </Col>

        <ConfirmationModal
          show={showModal}
          onHide={closeModal}
          onConfirm={() => handleClear(selectedTerm)}
          header={"Grant Clearance"}
          message={"Are you sure you want to clear this employee?"}
        />

        <ConfirmationModal
          show={showRevokeModal}
          onHide={closeRevokeModal}
          onConfirm={() => handleRevoke(selectedTerm)}
          header={"Revoke Clearance"}
          message={
            "Are you sure you want to revoke the clearance for this employee?"
          }
        />
      </Row>

      {currentRecords.length !== 0 ? (
        <>
          <Row className="w-100 mb-3">
            <ListGroup className="w-100" variant="flush">
              <ListGroup.Item className={styles.swtdHeader}>
                <Row>
                  <Col md={9}>Title of SWTD</Col>
                  <Col md={2}>Status</Col>
                  <Col md={1}>Points</Col>
                </Row>
              </ListGroup.Item>
            </ListGroup>
            <ListGroup>
              {currentRecords.reverse().map((item) => (
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
          <Row className="w-100 mb-3">
            <Col className="d-flex justify-content-center">
              <Pagination className={styles.pageNum}>
                <Pagination.First onClick={() => handlePageChange(1)} />
                <Pagination.Prev
                  onClick={() => {
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                />
                {Array.from({ length: totalPages }, (_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => handlePageChange(index + 1)}>
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => {
                    if (currentPage < totalPages)
                      handlePageChange(currentPage + 1);
                  }}
                />
                <Pagination.Last onClick={() => handlePageChange(totalPages)} />
              </Pagination>
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

export default EmployeeSWTD;
