import React from "react";
import { Button } from "react-bootstrap";
import styles from "./style.module.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="sidebar">
        <ul>
          <li>Dashboard</li>
          <li>Analytics</li>
          <li>Settings</li>
        </ul>
      </div>
      <div className="main-content">
        <h1>Welcome to Your Dashboard</h1>
        <p>This is where your dashboard content will go.</p>
      </div>

      <Button>Logout</Button>
    </div>
  );
};

export default Dashboard;
