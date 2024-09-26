import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Row, Col, Container, ListGroup, Spinner, Pagination } from "react-bootstrap"; /* prettier-ignore */

import { getAllSWTDs } from "../../api/swtd";
import SessionUserContext from "../../contexts/SessionUserContext";  
import styles from "./style.module.css";

const SWTDDashboard = () => {
  const id = Cookies.get("userID");
  const token = Cookies.get("userToken");
  const { user } = useContext(SessionUserContext);
  const navigate = useNavigate();

  const [userSWTDs, setUserSWTDs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  const fetchAllSWTDs = async () => {
    await getAllSWTDs(
      {
        author_id: id,
        token: token,
      },
      (response) => {
        setUserSWTDs(response.swtds);
        setLoading(false);
      },
      (error) => {
        if (error.response && error.response.data) {
          console.log(error.response.data.error);
        }
      }
    );
  };

  const truncateTitle = (title) => {
    if (title.length > 50) {
      return title.substring(0, 50) + "...";
    }
    return title;
  };

  const handleEditRecordClick = (id) => {
    navigate(`/swtd/${id}`);
  };

  useEffect(() => {
    if (user) {
      fetchAllSWTDs();
    } else {
      setLoading(true);
    }
  }, [user]);

  if (loading)
    return (
      <Row
        className={`${styles.loading} d-flex justify-content-center align-items-center w-100`}>
        <Spinner className={`me-2`} animation="border" />
        Loading data...
      </Row>
    );

  // Calculate pagination
  const totalRecords = userSWTDs.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = userSWTDs.slice(indexOfFirstRecord, indexOfLastRecord);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Container className="d-flex flex-column justify-content-start align-items-start">
      <Row className="w-100 mb-3">
        <Col>
          <h3 className={`${styles.label} d-flex align-items-center`}>
            View All SWTDs
          </h3>
        </Col>
      </Row>

      <Row className="w-100 mb-3">
        <ListGroup className="w-100" variant="flush">
          <ListGroup.Item className={styles.tableHeader}>
            <Row>
              <Col md={9}>Title</Col>
              <Col md={2}>Status</Col>
              <Col md={1}>Points</Col>
            </Row>
          </ListGroup.Item>
        </ListGroup>
        <ListGroup>
          {currentRecords.map((item) => (
            <ListGroup.Item
              key={item.id}
              className={styles.tableBody}
              onClick={() => handleEditRecordClick(item.id)}>
              <Row>
                <Col md={9}>{truncateTitle(item.title)}</Col>
                <Col md={2}>{item.validation.status}</Col>
                <Col md={1}>{item.points}</Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Row>

      <Row className="w-100 mb-3">
        <Col className="d-flex justify-content-center">
          <Pagination>
            {Array.from({ length: totalPages }, (_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => handlePageChange(index + 1)}>
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </Col>
      </Row>
    </Container>
  );
};

export default SWTDDashboard;
