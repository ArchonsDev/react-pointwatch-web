import React, { useState } from "react";
import { Container, Row, Col, ListGroup } from "react-bootstrap";

import styles from "./style.module.css";

const Notifications = ({ notifs }) => {
  console.log(notifs);
  return (
    <Container>
      <Row>
        <Col xs={12}>
          <h3 className={styles.label}>Notifications</h3>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <ListGroup>
            {notifs.map((noti) => (
              <ListGroup.Item key={noti.id}>
                <Row>
                  <Col>{noti.type} for </Col>
                  <Col>SWTD ID: {noti.data.id}</Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default Notifications;
