import React from "react";
import { Card } from "react-bootstrap"; /* prettier-ignore */

const PercentCard = ({ departments, level, term, title }) => {
  const dept = departments.find((dept) => dept.level === level);
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
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>
          {term.name}
          <br />({percentage}%) Cleared Employees
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default PercentCard;
