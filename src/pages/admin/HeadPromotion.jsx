import React, { useState, useEffect } from "react";
import { Row, Col, Form, InputGroup, Table, Spinner, Pagination } from "react-bootstrap"; /* prettier-ignore */
import Cookies from "js-cookie";

import { getAllUsers, updateHead } from "../../api/admin";

import styles from "./style.module.css";

const HeadPromotion = () => {
  const userID = Cookies.get("userID");
  const token = Cookies.get("userToken");
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  const fetchAllUsers = async () => {
    await getAllUsers(
      {
        token: token,
      },
      (response) => {
        const filter = response.users.filter(
          (user) => user.id !== parseInt(userID, 10)
        );
        setEmployees(filter);
        setLoading(false);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const grantRevokeHead = async (id, val) => {
    await updateHead(
      {
        id: id,
        token: token,
        is_admin: val,
      },
      (response) => {
        fetchAllUsers();
        setLoading(false);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const handleSearchFilter = (employeeList, query) => {
    return employeeList.filter((employee) => {
      const match =
        employee.employee_id.includes(query) ||
        employee.firstname.toLowerCase().includes(query.toLowerCase()) ||
        employee.lastname.toLowerCase().includes(query.toLowerCase());
      return match;
    });
  };

  // For pagination
  const filteredEmployees = searchQuery
    ? handleSearchFilter(employees, searchQuery)
    : employees;
  const totalRecords = filteredEmployees.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredEmployees.slice(
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
          Department Heads can access the dashboard to validate SWTD submissions
          and grant clearance to employees in their department.
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
                <span className={`${styles.table} `}>No employees found.</span>
              </Row>
            ) : (
              <Table className={styles.table} striped bordered hover responsive>
                <thead>
                  <tr>
                    <th className="col-2">ID No.</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th className="col-2 text-center">Department Head</th>
                    <th className="col-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords
                    .sort((a, b) => b.is_admin - a.is_admin)
                    .map((item) => (
                      <tr key={item.id}>
                        <td>{item.employee_id}</td>
                        <td>
                          {item.lastname}, {item.firstname}
                        </td>
                        <td>{item.department.name}</td>
                        <td className="text-center">
                          {item.is_admin ? (
                            <i
                              className={`${styles.icon} fa-solid fa-user-check text-success`}></i>
                          ) : (
                            <i
                              className={`${styles.icon} fa-solid fa-user-xmark text-danger`}></i>
                          )}
                        </td>
                        <td className="text-center">
                          {item.is_admin ? (
                            <div
                              className={styles.icon}
                              onClick={() => grantRevokeHead(item.id, false)}>
                              <i
                                className={`fa-solid fa-circle-arrow-down fa-xl text-danger me-2`}></i>
                              DEMOTE
                            </div>
                          ) : (
                            <div
                              className={styles.icon}
                              onClick={() => grantRevokeHead(item.id, true)}>
                              <i
                                className={`fa-solid fa-circle-arrow-up fa-xl text-success me-2`}></i>
                              PROMOTE
                            </div>
                          )}
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

export default HeadPromotion;
