import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Container, InputGroup, Form, ListGroup, DropdownButton, Dropdown, Modal, Spinner } from "react-bootstrap"; /* prettier-ignore */

import status from "../../data/status.json";
import { getTerms, clearEmployee, revokeEmployee } from "../../api/admin";
import { getAllSWTDs } from "../../api/swtd";
import { getUser, getClearanceStatus } from "../../api/user";
import { exportSWTDList } from "../../api/export";
import { useSwitch } from "../../hooks/useSwitch";
import SessionUserContext from "../../contexts/SessionUserContext";

import PaginationComponent from "../../components/Paging";
import PointsRequirement from "../../common/info/PointsRequirement";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import styles from "./style.module.css";

const EmployeeSWTD = () => {
  const { user } = useContext(SessionUserContext);
  const { id } = useParams();
  const token = Cookies.get("userToken");
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
  const [isProcessing, setIsProcessing] = useState(false);

  const [showModal, openModal, closeModal] = useSwitch();
  const [showRevokeModal, openRevokeModal, closeRevokeModal] = useSwitch();
  const recordsPerPage = 15;

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 762);
  };

  const fetchUser = async () => {
    await getUser(
      {
        id: id,
        token: token,
      },
      (response) => {
        const emp = response.data.user;
        setEmployee(emp);
        setDepartmentTypes({
          ...departmentTypes,
          semester: emp?.department?.use_schoolyear === false,
          midyear: emp?.department?.midyear_points > 0,
          academic: emp?.department?.use_schoolyear,
        });
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
        setUserSWTDs(response.swtd_forms);
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
        setTermPoints(response.points);
      }
    );
  };

  const handleViewSWTD = (swtd_id) => {
    navigate(`/dashboard/${id}/${swtd_id}`);
  };

  const handleClear = async (term) => {
    setIsProcessing(true);
    await clearEmployee(
      {
        id: id,
        term_id: term.id,
        token: token,
      },
      async (response) => {
        setIsProcessing(false);
        await fetchUser();
        await fetchTermPoints(term);
      }
    );
    setIsProcessing(false);
  };

  const handleRevoke = async (term) => {
    setIsProcessing(true);
    const clearance = employee.clearances.find(
      (clear) => clear.term.id === term.id && !clear.is_deleted
    );
    await revokeEmployee(
      {
        id: id,
        term_id: term.id,
        clear_id: clearance.id,
        token: token,
      },
      async (response) => {
        setIsProcessing(false);
        await fetchUser();
        await fetchTermPoints(term);
      }
    );
    setIsProcessing(false);
  };

  const truncateTitle = (title) => {
    const len = isMobile ? 12 : 30;
    if (title.length > len) {
      return title.substring(0, len) + "...";
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
        fetchUser();
      }
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (departmentTypes) {
      fetchTerms();
    }
  }, [departmentTypes]);

  useEffect(() => {
    if (selectedTerm && employee) {
      fetchTermPoints(selectedTerm);
      const termStatus = employee?.clearances?.find(
        (clearance) =>
          clearance.term.id === selectedTerm.id && !clearance.is_deleted
      );

      if (termStatus) setTermClearance(true);
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
    <Container className="d-flex flex-column justify-content-center align-items-center">
      <Row className="w-100 mb-2">
        <Col>
          <h3 className={styles.label}>
            <i
              className={`${styles.triangle} fa-solid fa-caret-left fa-xl`}
              onClick={() => {
                if (user?.is_staff) navigate("/hr-dashboard");
                else if (user?.is_superuser) navigate("/admin");
                else navigate("/dashboard");
              }}></i>{" "}
            {pageTitle}
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
      </Row>

      <Row className={`w-100 mb-4`}>
        <Col className={`${styles.employeeDetails} mb-3`} xl={4} lg={5} md={6}>
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
          <div>
            <i className="fa-solid fa-circle-check fa-lg me-2"></i>Total SWTDs
            Approved:{" "}
            <span className={styles.userStat}>
              {
                termSWTDs.filter(
                  (swtd) => swtd.validation_status === "APPROVED"
                ).length
              }{" "}
              SWTDs
            </span>
          </div>
        </Col>

        <Col className={`${styles.employeeDetails} mb-3`} xl={4} lg={3} md={6}>
          <div className={`${styles.userStat} mb-1`}>Employee Points</div>
          <div>
            <i className="fa-solid fa-circle-check fa-lg me-2"></i>Current
            Points:{" "}
            <span className={styles.userStat}>
              {termPoints?.valid_points} pts
            </span>
          </div>
          <div>
            <i className="fa-solid fa-circle-exclamation fa-lg me-2"></i>
            Required Points:{" "}
            <span className={styles.userStat}>
              {termPoints?.required_points} pts
            </span>
          </div>
          <div>
            <i className="fa-solid fa-circle-plus fa-lg me-2"></i>Excess Points:{" "}
            <span className={styles.userStat}>
              {employee?.point_balance} pts
            </span>
          </div>
        </Col>

        <Col className="d-flex flex-column justify-content-center text-lg-end text-md-start">
          <div className={`${styles.userStat} mb-3`}>
            <i className="fa-solid fa-user-check fa-lg me-1"></i>Status:{" "}
            <span
              className={`ms-1 text-${termClearance ? "success" : "danger"} ${
                styles.userStat
              }`}>
              {termClearance ? "CLEARED" : "PENDING CLEARANCE"}
            </span>
          </div>

          <div className="mb-1">
            {(user?.is_head || user?.is_staff || user?.is_superuser) &&
              selectedTerm !== null &&
              (termClearance ? (
                <>
                  <BtnSecondary
                    onClick={openRevokeModal}
                    disabled={isProcessing}>
                    <i className="fa-solid fa-xmark me-2"></i>Revoke
                  </BtnSecondary>{" "}
                </>
              ) : (
                <>
                  <BtnPrimary
                    onClick={openModal}
                    disabled={
                      isProcessing ||
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
              disabled={isProcessing || loading || userSWTDs.length === 0} // Disable when processing
            >
              <i className="fa-solid fa-file-arrow-down me-2"></i>
              Export
            </BtnSecondary>
          </div>
        </Col>
      </Row>

      <Row className="w-100">
        {/* SEARCH BAR */}
        <Col className="text-start p-0 me-2 mb-3" lg={6} md={6} xs={12}>
          <InputGroup className={`${styles.searchBar}`}>
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
        <Col
          className={`${styles.filterOption} p-0 mb-3`}
          lg={3}
          md={5}
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
          <ListGroup className="w-100" variant="flush">
            <ListGroup.Item className={styles.swtdHeader}>
              <Row>
                <Col lg={5} md={4} xs={7}>
                  Title
                </Col>
                {!isMobile && (
                  <Col lg={4} md={4}>
                    Category
                  </Col>
                )}
                <Col lg={2} md={2} xs={3}>
                  Status
                </Col>
                <Col className="text-center" lg={1} md={2} xs={2}>
                  Points
                </Col>
              </Row>
            </ListGroup.Item>
          </ListGroup>
          <ListGroup className="w-100">
            {currentRecords.reverse().map((item) => (
              <ListGroup.Item
                key={item.id}
                className={styles.tableBody}
                onClick={() => handleViewSWTD(item.id)}>
                <Row>
                  <Col lg={5} md={4} xs={7}>
                    {truncateTitle(item.title)}
                  </Col>
                  {!isMobile && (
                    <Col lg={4} md={4}>
                      {truncateTitle(item.category)}
                    </Col>
                  )}
                  <Col lg={2} md={2} xs={3}>
                    {item.validation_status === "REJECTED"
                      ? "FOR REVISION"
                      : item.validation_status}
                  </Col>
                  <Col className="text-center" lg={1} md={2} xs={2}>
                    {item.points}
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>

          <Row className="w-100 mt-3 mb-3">
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

export default EmployeeSWTD;
