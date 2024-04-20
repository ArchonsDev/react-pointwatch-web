import React, { useEffect, useContext } from "react";
import { Nav, Navbar, Offcanvas, Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router";

import SessionUserContext from "../../contexts/SessionUserContext";
import { useSwitch } from "../../hooks/useSwitch";

import ConfirmationModal from "../modals/ConfirmationModal";
import styles from "./style.module.css";

const Drawer = () => {
  const { user, setUser } = useContext(SessionUserContext);
  const [showDrawer, openDrawer, closeDrawer] = useSwitch();
  const [showModal, openModal, closeModal] = useSwitch();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  // Comment this to access pages w/o logging in lol
  useEffect(() => {
    if (user === null) {
      navigate("/");
    }
  }, [navigate, user]);

  return (
    <div>
      <Navbar
        expand={false}
        className={`${styles.navbar} d-flex align-items-start h-100 m-0 p-0`}
        onMouseLeave={() => closeDrawer()}>
        {/* Sidebar Hover */}
        <Navbar.Toggle
          aria-controls={`offcanvasNavbar`}
          className={`${styles.toggle} h-100 mb-auto`}
          onClick={() => (showDrawer ? closeDrawer() : openDrawer())}
          onMouseEnter={() => openDrawer()}
          style={{ borderRadius: "0" }}>
          <i className="fa-solid fa-chevron-right"></i>
        </Navbar.Toggle>

        {/* Drawer pop-up */}
        <Navbar.Offcanvas
          show={showDrawer}
          id={`offcanvasNavbar`}
          aria-labelledby={`offcanvasNavbarLabel`}
          className={styles.sidebar}
          placement="start"
          onHide={() => closeDrawer()}>
          {/* Profile picture */}
          <Offcanvas.Header className="d-flex justify-content-center align-items-center">
            <Offcanvas.Title id={`offcanvasNavbarLabel`}>
              <div className={`${styles.circle} mb-3`}></div>
              <Row className="flex-column">
                <Col className={`${styles.name} text-center`}>
                  0001 John Doe
                </Col>
                <Col className={`${styles.title} text-center`}>Admin</Col>
              </Row>
            </Offcanvas.Title>
          </Offcanvas.Header>
          {/* Navigate Pages */}
          <Offcanvas.Body className="d-flex flex-column p-0">
            <div className="flex-grow-1">
              <Nav>
                <Nav.Link
                  className={`mx-3 my-1 p-3 ${
                    location.pathname === "/notifications"
                      ? styles.active
                      : styles.navItem
                  }`}>
                  <i
                    className={`fa-solid fa-bell fa-lg ${styles.drawerIcon}`}></i>
                  <span className="px-2">Notifications</span>
                </Nav.Link>
                <Nav.Link
                  className={`mx-3 my-1 p-3 ${
                    location.pathname === "/dashboard"
                      ? styles.active
                      : styles.navItem
                  }`}
                  onClick={(e) => navigate("/dashboard")}>
                  <i
                    className={`fa-solid fa-house fa-lg ${styles.drawerIcon}`}></i>
                  <span className="px-2">Dashboard</span>
                </Nav.Link>

                <Nav.Link
                  className={`mx-3 my-1 p-3 ${
                    location.pathname === "/swtd"
                      ? styles.active
                      : styles.navItem
                  }`}>
                  <i
                    className={`fa-solid fa-table-list fa-lg ${styles.drawerIcon}`}></i>
                  <span className="px-2">SWTDs</span>
                </Nav.Link>

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

            <Nav.Item className={styles.logout}>
              <Nav.Link
                className={`mx-3 mb-3 p-3 ${styles.navItem}`}
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
      </Navbar>
    </div>
  );
};

export default Drawer;
