import React, { useState, useEffect } from "react";
import { Row, Col, Form, InputGroup, Table, Spinner, Pagination } from "react-bootstrap"; /* prettier-ignore */
import Cookies from "js-cookie";

import { getAllUsers } from "../../api/admin";
import { exportStaffReport, exportAdminReport } from "../../api/export";

import styles from "./style.module.css";
import BtnPrimary from "../../common/buttons/BtnPrimary";

const DepartmentHeadActivity = () => {
  const token = Cookies.get("userToken");
  const [loading, setLoading] = useState(true);
  const [heads, setHeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  const fetchAllUsers = async () => {
    await getAllUsers(
      {
        token: token,
      },
      (response) => {
        const filtered = response.users.filter((user) => user.is_admin);
        setHeads(filtered);
        setLoading(false);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const handlePrintValidation = (head) => {
    exportStaffReport(
      {
        id: head.id,
        token: token,
      },
      (response) => {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const blobURL = URL.createObjectURL(blob);
        window.open(blobURL, "_blank");
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const handlePrintClearance = (head) => {
    exportAdminReport(
      {
        id: head.id,
        token: token,
      },
      (response) => {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const blobURL = URL.createObjectURL(blob);
        window.open(blobURL, "_blank");
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const handleSearchFilter = (headList, query) => {
    return headList.filter((head) => {
      const match =
        head.employee_id.includes(query) ||
        head.firstname.toLowerCase().includes(query.toLowerCase()) ||
        head.lastname.toLowerCase().includes(query.toLowerCase());
      return match;
    });
  };

  const filteredHeads = searchQuery
    ? handleSearchFilter(heads, searchQuery)
    : heads;
  const totalRecords = filteredHeads.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredHeads.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);
  return (
    <>
      <Row className={`${styles.table} w-100`}>
        <span className="text-muted mb-3">
          Export reports detailing Department Head activities, including SWTD
          validations and employee clearance approvals.
        </span>
      </Row>
      <Row>
        <InputGroup className={`${styles.searchBar} mb-3`}>
          <InputGroup.Text>
            <i className="fa-solid fa-magnifying-glass"></i>
          </InputGroup.Text>
          <Form.Control
            type="search"
            placeholder="Search by ID number, firstname, or lastname"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </Row>
      <Row>
        {loading ? (
          <Row
            className={`${styles.loading} d-flex justify-content-center align-items-center w-100 mb-5`}>
            <Spinner className={`me-2`} animation="border" />
            Loading department heads...
          </Row>
        ) : (
          <>
            {currentRecords.length === 0 ? (
              <Row className="d-flex justify-content-center align-items-center mt-3 mb-3 w-100">
                <span className={`${styles.table}`}>No employees found.</span>
              </Row>
            ) : (
              <Table className={styles.table} striped bordered hover responsive>
                <thead>
                  <tr>
                    <th className="col-2">ID No.</th>
                    <th>Name</th>
                    <th className="col-2 text-center">Validation Report</th>
                    <th className="col-2 text-center">Clearance Report</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((item) => (
                    <tr key={item.id}>
                      <td>{item.employee_id}</td>
                      <td>
                        {item.lastname}, {item.firstname}
                      </td>
                      <td className="text-center">
                        <BtnPrimary onClick={() => handlePrintValidation(item)}>
                          <i className="fa-solid fa-file-arrow-down me-2"></i>
                          Export PDF
                        </BtnPrimary>
                      </td>
                      <td className="text-center">
                        <BtnPrimary onClick={() => handlePrintClearance(item)}>
                          <i className="fa-solid fa-file-arrow-down me-2"></i>
                          Export PDF
                        </BtnPrimary>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </Row>
      <Row className="w-100 mb-3">
        <Col className="d-flex justify-content-center">
          <Pagination>
            <Pagination.First
              className={styles.pageNum}
              onClick={() => handlePageChange(1)}
            />
            <Pagination.Prev
              className={styles.pageNum}
              onClick={() => {
                if (currentPage > 1) handlePageChange(currentPage - 1);
              }}
            />
            {Array.from({ length: totalPages }, (_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                className={styles.pageNum}
                onClick={() => handlePageChange(index + 1)}>
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              className={styles.pageNum}
              onClick={() => {
                if (currentPage < totalPages) handlePageChange(currentPage + 1);
              }}
            />
            <Pagination.Last
              className={styles.pageNum}
              onClick={() => handlePageChange(totalPages)}
            />
          </Pagination>
        </Col>
      </Row>
    </>
  );
};

export default DepartmentHeadActivity;
