import React from "react";
import styles from "./style.module.css";
import { Row, Col, Form } from "react-bootstrap";
import BtnPrimary from "../../common/buttons/BtnPrimary";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

const Registration = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>
          <i className={`${styles.icon} fa-solid fa-caret-left fa-xl`}></i>{" "}
          Create Account
        </h1>
      </header>

      <div className={styles.container2}>
        <div className={styles.inputGroup}>
          <div>
            <div className="row pt-3">
              <div className="col">
                <div className={`${styles.inputContainer}`}>
                  <input
                    type="text"
                    className={`form-control ${styles.inputMargin}`}
                    placeholder="ID number"
                    id="inputIDnum"
                    name="idnum"
                  />
                </div>
              </div>
              <div className="col">
                <div className={`${styles.inputContainer}`}>
                  <input
                    type="text"
                    className={`form-control ${styles.inputMargin}`}
                    placeholder="Email"
                    id="inputEmail"
                    name="email"
                  />
                </div>
              </div>
            </div>
            <div className="row pt-3">
              <div className="col">
                <div className={`${styles.inputContainer}`}>
                  <input
                    type="text"
                    className={`form-control ${styles.inputMargin}`}
                    placeholder="Firstname"
                    id="inputFirstname"
                    name="firstname"
                  />
                </div>
              </div>
              <div className="col">
                <div className={`${styles.inputContainer}`}>
                  <input
                    type="text"
                    className={`form-control ${styles.inputMargin}`}
                    placeholder="Lastname"
                    id="inputLastname"
                    name="lastname"
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <div className={`${styles.inputContainer}`}>
                <input
                  type="password"
                  className={`form-control ${styles.inputMargin}`}
                  id="inputPassword"
                  placeholder="Password"
                  name="password"
                />
              </div>
            </div>
            <div className="form-group">
              <div className={`${styles.inputContainer}`}>
                <input
                  type="password"
                  className={`form-control ${styles.inputMargin}`}
                  id="inputConfirmPassword"
                  placeholder="Confirm Password"
                  name="confirmPassword"
                />
              </div>
            </div>
          </div>

          <DropdownButton
            id="dptdrop"
            title="Departments"
            className={styles.DropdownButton}
          >
            <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
            <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
          </DropdownButton>
        </div>
        {/* Register button */}
        <div className={styles.regBtnContainer}>
          <BtnPrimary className={styles.regBtn}>Register</BtnPrimary>
        </div>
      </div>

      <div className={styles.content}></div>
    </div>
  );
};

export default Registration;
