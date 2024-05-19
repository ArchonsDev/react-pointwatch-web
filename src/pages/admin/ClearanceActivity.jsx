import React, { useState, useEffect } from "react";
import { Row, Form, InputGroup, Table } from "react-bootstrap";
import Cookies from "js-cookie";

import { getAllUsers } from "../../api/admin";
import { exportAdminReport } from "../../api/export";

import styles from "./style.module.css";
import BtnPrimary from "../../common/buttons/BtnPrimary";

const ClearanceActivity = () => {
  const token = Cookies.get("userToken");
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAllUsers = async () => {
    await getAllUsers(
      {
        token: token,
      },
      (response) => {
        const filtered = response.users.filter((user) => user.is_admin);
        setAdmins(filtered);
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const handlePrint = (admin) => {
    exportAdminReport(
      {
        id: admin.id,
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

  const displayEmployee = admins.filter(
    (admin) =>
      admin.employee_id.includes(searchQuery) ||
      admin.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.lastname.toLowerCase().includes(searchQuery.toLowerCase())
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
        {displayEmployee.length === 0 ? (
          <span
            className={`${styles.table} d-flex justify-content-center align-items-center mt-5 w-100`}>
            No employees found.
          </span>
        ) : (
          <Table className={styles.table} striped bordered hover responsive>
            <thead>
              <tr>
                <th className="col-1">ID</th>
                <th className="col-2">Employee ID</th>
                <th>Name</th>
                <th className="col-2">Clearance Report</th>
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

export default ClearanceActivity;
