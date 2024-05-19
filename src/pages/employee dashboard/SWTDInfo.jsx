import React from "react";
import { Table } from "react-bootstrap";

import styles from "./style.module.css";

const SWTDInfo = () => {
  return (
    <>
      <Table striped bordered hover responsive className={styles.cardBody}>
        <thead className={styles.formLabel}>
          <tr>
            <th>Department</th>
            <th>Points Required</th>
            <th>Compliance Schedule</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>College</td>
            <td>6 pts./semester & 3 pts./mid-year</td>
            <td>Part of Clearance - End of every semester</td>
          </tr>
          <tr>
            <td>Senior High School</td>
            <td>6 pts./semester & 3 pts./mid-year</td>
            <td>Part of Clearance - End of every semester</td>
          </tr>
          <tr>
            <td>Junior High School</td>
            <td>12 pts./school year & 3pts./mid-year</td>
            <td>Part of Clearance - End of the school year</td>
          </tr>
          <tr>
            <td>Elementary</td>
            <td>12 pts./school year & 3pts./mid-year</td>
            <td>Part of Clearance - End of the school year</td>
          </tr>
          <tr>
            <td>Administrative</td>
            <td>10 pts./school year</td>
            <td>Part of AEPA - End of the school year</td>
          </tr>
        </tbody>
      </Table>
    </>
  );
};

export default SWTDInfo;
