import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup, DropdownButton, Dropdown, Modal, Spinner, Pagination } from "react-bootstrap"; /* prettier-ignore */

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
  const [termPoints, setTermPoints] = useState(null);
  const [termClearance, setTermClearance] = useState(null);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [departmentTypes, setDepartmentTypes] = useState({
    semester: false,
    midyear: false,
    academic: false,
  });
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
        setEmployee(response.data.data);
        fetchAllSWTDs();
      },
      (error) => {
        console.log(error.response);
      }
    );
  };

  const fetchAllSWTDs = () => {
    getAllSWTDs(
      {
        author_id: id,
        token: token,
      },
      (response) => {
        setUserSWTDs(response.data);
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

  const handleViewSWTD = (swtd_id) => {
    navigate(`/dashboard/${id}/${swtd_id}`);
  };

  const handleClear = async (term) => {
    await clearEmployee(
      {
        id: id,
        term_id: term.id,
        token: token,
      },
      async (response) => {
        await fetchUser();
        await fetchTermPoints(term);
      }
    );
  };

  const handleRevoke = async (term) => {
    await revokeEmployee(
      {
        id: id,
        term_id: term.id,
        token: token,
      },
      async (response) => {
        await fetchUser();
        await fetchTermPoints(term);
      }
    );
  };

  const truncateTitle = (title) => {
    if (title.length > 40) {
      return title.substring(0, 40) + "...";
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
    return swtdList?.filter((swtd) => {
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
    if (!user) setLoading(true);
    else {
      if (!user?.is_head && !user?.is_staff && !user?.is_superuser)
        navigate("/swtd");
      else {
        setDepartmentTypes({
          ...departmentTypes,
          semester: user?.department?.use_schoolyear === false ? true : false,
          midyear: user?.department?.midyear_points > 0 ? true : false,
          academic: user?.department?.use_schoolyear,
        });
        fetchUser();
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (departmentTypes) {
      fetchTerms();
    }
  }, [departmentTypes]);

  useEffect(() => {
    if (selectedTerm) fetchTermPoints(selectedTerm);
    const termStatus = employee?.clearances?.find(
      (clearance) => clearance.term.id === selectedTerm.id
    );
    if (termStatus) setTermClearance(termStatus.is_deleted ? false : true);
    else setTermClearance(false);
  }, [selectedTerm]);

  useEffect(() => {
    if (selectedTerm && employee) {
      fetchTermPoints(selectedTerm);
      const termStatus = employee?.clearances?.find(
        (clearance) => clearance.term.id === selectedTerm.id
      );
      if (termStatus) setTermClearance(termStatus.is_deleted ? false : true);
      else setTermClearance(false);
    }
  }, [selectedTerm, employee]);

  if (loading)
    return (
      <Row
        className={`${styles.msg} d-flex flex-column justify-content-center align-items-center w-100`}
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
    <Container className="d-flex flex-column justify-content-start align-items-start">
      <Row className="w-100 mb-2">
        <Col>
          <h3 className={styles.label}>
            <i
              className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
              onClick={() => {
                if (user?.is_staff || user?.is_superuser) navigate("/hr");
                else navigate("/dashboard");
              }}></i>{" "}
            {pageTitle}
            <i
              className={`${styles.commentEdit} fa-solid fa-circle-info fa-xs ms-2`}
              onClick={openPointsModal}></i>
          </h3>
        </Col>

        <Col
          className={`d-flex align-items-center ${styles.employeeDetails}`}
          md="auto">
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
                      fetchTermPoints(term);
                      setSelectedTerm(term);
                    }}>
                    {term.name}
                  </Dropdown.Item>
                ))}
            </DropdownButton>
          )}
        </Col>

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

      <Row className={`w-100 mb-4`}>
        <Col className={styles.employeeDetails} lg={4}>
          <div className={`${styles.userStat} mb-1`}>SWTD Statistics</div>
          <div>
            <i className="fa-solid fa-spinner fa-lg me-2"></i>Total Pending
            SWTDs:{" "}
            <span className={styles.userStat}>
              {
                termSWTDs.filter((swtd) => swtd.validation_status === "PENDING")
                  .length
              }{" "}
              SWTDs
            </span>
          </div>
          <div>
            <i className="fa-solid fa-circle-xmark fa-lg me-2"></i>Total SWTDs
            For Revision:{" "}
            <span className={styles.userStat}>
              {
                termSWTDs.filter(
                  (swtd) => swtd.validation_status === "REJECTED"
                ).length
              }{" "}
              SWTDs
            </span>
          </div>
        </Col>

        <Col className={styles.employeeDetails} lg={4}>
          <div className={`${styles.userStat} mb-1`}>User Points</div>
          <div>
            <i className="fa-solid fa-circle-check fa-lg me-2"></i>Current
            Points:{" "}
            <span className={styles.userStat}>
              {termPoints?.valid_points} pts
            </span>
          </div>
          <div>
            <i className="fa-solid fa-circle-plus fa-lg me-2"></i>Excess Points:{" "}
            <span className={styles.userStat}>
              {employee?.point_balance} pts
            </span>
          </div>
        </Col>

        <Col className="text-end">
          <div className={`${styles.employeeDetails}`}>
            <i className="fa-solid fa-user-check fa-lg me-1"></i>Status:{" "}
            <span
              className={`ms-1 text-${termClearance ? "success" : "danger"} ${
                styles.userStat
              }`}>
              {termClearance ? "CLEARED" : "PENDING CLEARANCE"}
            </span>
          </div>
          <div className={`${styles.employeeDetails} mb-1`}>
            Required Points:{" "}
            <span className={styles.userStat}>
              {termPoints?.required_points} pts
            </span>
          </div>
          <div className="mb-1">
            {(user?.is_head || user?.is_staff || user?.is_superuser) &&
              selectedTerm !== null &&
              (termClearance ? (
                <>
                  <BtnSecondary onClick={openRevokeModal}>
                    <i className="fa-solid fa-xmark me-2"></i>Revoke
                  </BtnSecondary>{" "}
                </>
              ) : (
                <>
                  <BtnPrimary
                    onClick={openModal}
                    disabled={
                      termPoints?.valid_points + employee?.point_balance <
                      termPoints?.required_points
                    }>
                    <i className="fa-solid fa-check me-2"></i>
                    Clear
                  </BtnPrimary>{" "}
                </>
              ))}
            <BtnSecondary
              onClick={handlePrint}
              disabled={loading || userSWTDs.length === 0}>
              <i className="fa-solid fa-file-arrow-down me-2"></i>
              Export
            </BtnSecondary>
          </div>
        </Col>
      </Row>

      {/* <Row className="w-100">
        <Col className="p-0">
          <hr className="mt-0" style={{ opacity: 1 }} />
        </Col>
      </Row> */}

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
                  <Col md={5}>Title</Col>
                  <Col md={4}>Category</Col>
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
                    <Col md={5}>{truncateTitle(item.title)}</Col>
                    <Col md={4}>{truncateTitle(item.category)}</Col>
                    <Col md={2}>
                      {item.validation_status === "REJECTED"
                        ? "FOR REVISION"
                        : item.validation_status}
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
