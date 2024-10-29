import React from "react";
import { Table } from "react-bootstrap";

import styles from "./style.module.css";

const Categories = () => {
  return (
    <>
      <Table striped bordered hover responsive className={styles.cardBody}>
        <thead className={styles.formLabel}>
          <tr>
            <th className="col-2">HR SWTD Activity</th>
            <th className="col-3">Description</th>
            <th className="col-1">Points</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Profession or work-relevant webinar</td>
            <td>
              2-hour duration (Passive listening)
              <br />
              4-hour duration (Passive listening)
              <br />
              8-hour duration (Passive listening)
            </td>
            <td>
              1 point
              <br />2 points
              <br />4 points
            </td>
          </tr>
          <tr>
            <td>Life-relevant webinar</td>
            <td>
              2-hour duration (Passive listening)
              <br />
              4-hour duration (Passive listening)
              <br />
              8-hour duration (Passive listening)
            </td>
            <td>
              0.5 points
              <br />1 point
              <br />4 points
            </td>
          </tr>
          <tr>
            <td>Face2Face Seminar Workshop</td>
            <td>
              2-hour duration (with certificate)
              <br />
              4-hour duration (with certificate)
              <br />
              8-hour duration (with certificate)
            </td>
            <td>
              1.5 points
              <br />3 point
              <br />6 points
            </td>
          </tr>
          <tr>
            <td>
              Webinar with assignments/ Short Remote courses with assignments/
              Webinar-workshop
            </td>
            <td>
              2-hour duration (with certificate)
              <br />
              4-hour duration (with certificate)
              <br />
              8-hour duration (with certificate)
            </td>
            <td>
              1.5 points
              <br />3 point
              <br />6 points
            </td>
          </tr>
          <tr>
            <td>Training Participation</td>
            <td>
              Skills acquisition – intensive; with assignments, activities,
              workshops and certificate
            </td>
            <td>
              2 points
              <br />4 point
              <br />8 points
            </td>
          </tr>
          <tr>
            <td>Speakership/Organizing of SWTD</td>
            <td>
              With evidence of request or invitation for speakership, speaking
              engagement, program, etc.; For organizing of SWTD, only the lead
              organizer/organizers will earn corresponding points
            </td>
            <td>
              2 points
              <br />4 point
              <br />8 points
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
};

export default Categories;
