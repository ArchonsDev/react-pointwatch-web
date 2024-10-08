import React, { useContext } from "react";
import Cookies from "js-cookie";
import { Nav, Navbar, Offcanvas, Row, Col, Container } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router";

import SessionUserContext from "../../contexts/SessionUserContext";
import { useSwitch } from "../../hooks/useSwitch";

import ConfirmationModal from "../modals/ConfirmationModal";
import logo1 from "../../images/logo1.png";
import styles from "./style.module.css";

const Drawer = () => {
  const { user } = useContext(SessionUserContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [showModal, openModal, closeModal] = useSwitch();

  const handleLogout = () => {
    Cookies.remove("userToken");
    Cookies.remove("userID");
    navigate("/");
  };

  return (
    <>
      <Navbar expand={false} className={`${styles.navbar} mb-5`}>
        <Container fluid>
          <Navbar.Toggle
            className={`${styles.toggle} me-3`}
            aria-controls={`offcanvasNavbar-expand`}>
            <i className="fa-solid fa-bars fa-xl"></i>
          </Navbar.Toggle>

          <Navbar.Brand
            className={`${styles.header} d-flex justify-content-center align-items-center`}>
            <div className="d-flex justify-content-center align-items-center">
              <img
                src={logo1}
                height={40}
                className="d-inline-block align-top me-2"
                alt="PointWatch Logo"
              />
              PointWatch
            </div>
          </Navbar.Brand>

          <Nav className="d-flex ms-auto flex-row">
            {/* <Nav.Link
              className="me-3"
              onClick={() => navigate("/notifications")}>
              <i className={`fa-solid fa-bell fa-lg ${styles.icon}`}></i>
              <span className={`${styles.rightNav} px-2`}>Notifications</span>
            </Nav.Link> */}
            <Nav.Link className="me-3" onClick={() => navigate("/settings")}>
              <i className={`fa-solid fa-gear fa-lg ${styles.icon}`}></i>
              <span className={`${styles.rightNav} px-2`}>Settings</span>
            </Nav.Link>
            <Nav.Link className="me-3" onClick={openModal}>
              <i
                className={`fa-solid fa-arrow-right-from-bracket fa-lg ${styles.icon}`}></i>
              <span className={`${styles.rightNav} px-2`}>Log out</span>
            </Nav.Link>
          </Nav>

          {/* Drawer pop-up */}
          <Navbar.Offcanvas
            id={`offcanvasNavbar-expand`}
            aria-labelledby={`offcanvasNavbarLabel-expand`}
            className={styles.sidebar}
            placement="start">
            <Offcanvas.Header className="d-flex justify-content-center align-items-center">
              <Offcanvas.Title id={`offcanvasNavbarLabel-expand`}>
                <Row className="flex-column">
                  <Col className="d-flex justify-content-center align-items-center mb-1">
                    <img
                      src={logo1}
                      style={{ width: "30%" }}
                      alt="PointWatch Logo"
                    />
                  </Col>
                  <Col className="text-center mb-4">
                    <span
                      className={`${styles.brand} d-flex justify-content-center`}>
                      PointWatch
                    </span>
                  </Col>
                </Row>
              </Offcanvas.Title>
            </Offcanvas.Header>

            {/* Navigate Pages */}
            <Offcanvas.Body className="d-flex flex-column p-0">
              <div className="flex-grow-1">
                <Nav>
                  {/* Dashboard */}
                  {(user?.is_admin || user?.is_superuser) && (
                    <Nav.Link
                      className={`mx-3 my-1 p-3 ${
                        location.pathname === "/dashboard"
                          ? styles.active
                          : styles.navItem
                      }`}
                      onClick={(e) => navigate("/dashboard")}>
                      <i
                        className={`fa-solid fa-square-poll-vertical fa-lg ${styles.drawerIcon}`}></i>
                      <span className="px-2">Dashboard</span>
                    </Nav.Link>
                  )}

                  {(user?.is_staff || user?.is_superuser) && (
                    <Nav.Link
                      className={`mx-3 my-1 p-3 ${
                        location.pathname === "/hr"
                          ? styles.active
                          : styles.navItem
                      }`}
                      onClick={(e) => navigate("/hr")}>
                      <i
                        className={`fa-solid fa-list-check fa-lg ${styles.drawerIcon}`}></i>
                      <span className="px-2">Points Overview</span>
                    </Nav.Link>
                  )}

                  {/* SWTDs */}
                  <Nav.Link
                    className={`mx-3 my-1 p-3 ${
                      location.pathname === "/swtd"
                        ? styles.active
                        : styles.navItem
                    }`}
                    onClick={(e) => navigate("/swtd")}>
                    <i
                      className={`fa-solid fa-table-list fa-lg ${styles.drawerIcon}`}></i>
                    <span className="px-2">SWTDs</span>
                  </Nav.Link>

                  {/* Admin */}
                  {(user?.is_staff || user?.is_superuser) && (
                    <Nav.Link
                      className={`mx-3 my-1 p-3 ${
                        location.pathname === "/admin"
                          ? styles.active
                          : styles.navItem
                      }`}
                      onClick={(e) => navigate("/admin")}>
                      <i
                        className={`fa-solid fa-user-tie fa-lg ${styles.drawerIcon}`}></i>
                      <span className="px-2">System Management</span>
                    </Nav.Link>
                  )}

                  {/* Settings */}
                  <Nav.Link
                    className={`mx-3 my-1 p-3 ${
                      location.pathname === "/settings"
                        ? styles.active
                        : styles.navItem
                    }`}
                    onClick={(e) => navigate("/settings")}>
                    <i
                      className={`fa-solid fa-gear fa-lg ${styles.drawerIcon}`}></i>
                    <span className="px-2">Settings</span>
                  </Nav.Link>
                </Nav>
              </div>
              <Row className="w-100 p-4 flex-column">
                <Col className={`${styles.name}`}>
                  {user?.firstname} {user?.lastname}
                </Col>
                <Col className={`${styles.detail}`}>{user?.employee_id}</Col>
                <Col className={`${styles.detail}`}>{user?.department}</Col>
              </Row>
              {/* Logout */}
              <Nav.Item className={styles.logout}>
                <Nav.Link
                  className={`mx-3 p-3 ${styles.logoutItem}`}
                  onClick={openModal}>
                  <i
                    className={`fa-solid fa-arrow-right-from-bracket fa-lg ${styles.drawerIcon}`}></i>
                  <span className="px-2">Log out</span>
                </Nav.Link>
                <ConfirmationModal
                  show={showModal}
                  onHide={closeModal}
                  onConfirm={handleLogout}
                  header={"Log Out"}
                  message={"Do you wish to log out?"}
                />
              </Nav.Item>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
};

export default Drawer;
