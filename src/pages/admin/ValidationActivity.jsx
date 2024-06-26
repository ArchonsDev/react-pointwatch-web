import React, { useState, useEffect } from "react";
import { Row, Form, InputGroup, Table, Spinner } from "react-bootstrap";
import Cookies from "js-cookie";

import { getAllUsers } from "../../api/admin";
import { exportStaffReport } from "../../api/export";

import styles from "./style.module.css";
import BtnPrimary from "../../common/buttons/BtnPrimary";

const ValidationActivity = () => {
  const token = Cookies.get("userToken");

  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAllUsers = async () => {
    await getAllUsers(
      {
        token: token,
      },
      (response) => {
        const filtered = response.users.filter(
          (user) => user.is_admin || user.is_staff
        );
        setStaff(filtered);
        setLoading(false);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const handlePrint = (staff) => {
    exportStaffReport(
      {
        id: staff.id,
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

  const displayEmployee = staff.filter(
    (st) =>
      st.employee_id.includes(searchQuery) ||
      st.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.lastname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchAllUsers();
  }, []);
  return (
    <>
      <Row>
        <InputGroup className={`${styles.searchBar} mb-3`}>
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
      </Row>
      <Row>
        {displayEmployee.length === 0 && !loading && (
          <span
            className={`${styles.table} d-flex justify-content-center align-items-center mt-5 w-100`}>
            No employees found.
          </span>
        )}
        {loading ? (
          <Row
            className={`${styles.loading} d-flex justify-content-center align-items-center w-100`}>
            <Spinner className={`me-2`} animation="border" />
            Loading staff...
          </Row>
        ) : (
          <Table className={styles.table} striped bordered hover responsive>
            <thead>
              <tr>
                <th className="col-1">ID</th>
                <th className="col-2">Employee ID</th>
                <th>Name</th>
                <th className="col-2">Role</th>
                <th className="col-2">Validation Report</th>
              </tr>
            </thead>
            <tbody>
              {displayEmployee &&
                displayEmployee.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.employee_id}</td>
                    <td>
                      {item.lastname}, {item.firstname}
                    </td>
                    <td>{item.is_admin ? "ADMIN" : "STAFF"}</td>
                    <td>
                      <BtnPrimary onClick={() => handlePrint(item)}>
                        Export PDF
                      </BtnPrimary>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
      </Row>
    </>
  );
};

export default ValidationActivity;
