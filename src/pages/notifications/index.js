import React, { useState, useEffect } from "react";
import { Container, Row, Col, ListGroup } from "react-bootstrap";
import io from "socket.io-client";
import styles from "./style.module.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Establish WebSocket connection
    const socket = io("http://localhost:5000/notifications");

    // Listen for incoming notifications
    socket.on("swtd_validation_update", (data) => {
      // Assuming data is in the format: { id, message, isNew }
      setNotifications((prevNotifications) => [...prevNotifications, data]);
    });

    // Clean up WebSocket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []); // Run only once on component mount

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
            {notifications.map((notification) => (
              <ListGroup.Item key={notification.id}>
                <Row>
                  <Col xs={10}>{notification.message}</Col>
                  <Col xs={2}>
                    {notification.isNew && (
                      <span className={styles.notifLabel}>New</span>
                    )}
                  </Col>
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
