import React from "react";
import { Card } from "react-bootstrap"; /* prettier-ignore */
import styles from "./styles.module.css";

const PercentCard = ({ departments, level, term, title }) => {
  const dept = departments.find((dept) => dept.level.startsWith(level));
  const total = dept?.members?.length || 0;
  const clearedMembers =
    dept?.members?.reduce((clearedCount, member) => {
      const termStatus = member?.clearances?.find(
        (clearance) => clearance?.term?.id === term.id && !clearance.is_deleted
      );
      return termStatus ? clearedCount + 1 : clearedCount;
    }, 0) || 0;

  const percentage =
    total > 0 ? ((clearedMembers / total) * 100).toFixed(2) : 0;

  return (
    <Card>
      <Card.Header
        className={`${styles.percentHeader} text-center`}
        style={{ fontFamily: "Poppins-SemiBold" }}>
        {title}
      </Card.Header>
      <Card.Body className="text-center">
        <Card.Title style={{ fontFamily: "Poppins-SemiBold" }}>
          {percentage}%
        </Card.Title>
        <Card.Text style={{ fontFamily: "Poppins-Regular" }}>
          <span style={{ fontFamily: "Poppins-Medium" }}>
            Cleared Employees
          </span>
          <br />
          {term?.name}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default PercentCard;
