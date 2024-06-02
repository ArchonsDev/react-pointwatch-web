// Library imports
import React from "react";
import { Row, Col, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// CSS
import styles from "./styles.module.css";

export const SWTDTable = ({ data }) => {
    const content = data ? data : [];
    const navigate = useNavigate();

    const handleItemClick = (id) => {
      navigate(`/swtd/${id}`);
    }

    return (
      <>
        <ListGroup className="w-100 mx-0 px-0" variant="flush">
            {content.length === 0 ? (
              <span className={`${styles.msg} d-flex justify-content-center align-items-center mt-5 w-100`}>
                No records.
              </span>
            ) : (
              <ListGroup.Item className={styles.tableHeader}>
                <Row>
                  <Col xs={2} sm={1}>No.</Col>
                  <Col xs={5} sm={7}>Title of SWTD</Col>
                  <Col xs={2} sm={2}>Points</Col>
                  <Col xs={3} sm={2}>Status</Col>
                </Row>
              </ListGroup.Item>
            )}
        </ListGroup>
        <ListGroup className="mx-0 px-0">
          {content.map((item) => (
            <ListGroup.Item key={item.id} className={styles.tableBody} onClick={() => handleItemClick(item.id)}>
              <Row>
                <Col xs={2} sm={1} className={styles['table-content']}>{item.id}</Col>
                <Col xs={5} sm={7} className={styles['table-content']}>{item.title}</Col>
                <Col xs={2} sm={2} className={styles['table-content']}>{item.points}</Col>
                <Col xs={3} sm={2} className={styles['table-content']}>{item.validation.status}</Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </>
    );
}

export default SWTDTable;