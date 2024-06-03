import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, InputGroup, Form } from "react-bootstrap";

// CSS
import styles from "./styles.module.css";

// Custom Components
import BtnPrimary from "../../common/buttons/BtnPrimary";
import BtnSecondary from "../../common/buttons/BtnSecondary";
import DepartmentRequiredModal from "../../modals/DepartmentRequiredModal";

// API
import { exportSWTDList } from "../../api/export";

// Context
import SessionUserContext from "../../contexts/SessionUserContext";

// Custom Hooks
import { useSwitch } from "../../hooks/useSwitch";

export const TableControls = ({ term, data, onFilter }) => {
  const navigate = useNavigate();
  const { user } = useContext(SessionUserContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [showModal, openModal, closeModal] = useSwitch();

  const handleAddRecordClick = () => {
    navigate("/swtd/form");
  };

  const handlePrint = () => {
    exportSWTDList(
      {
        id: user.id,
        token: user.token,
      },
      (response) => {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const blobURL = URL.createObjectURL(blob);
        window.open(blobURL, "_blank");
      },
      (error) => {
        console.log(error);
      }
    );
  };

  // Term/Status/Search side effect
  useEffect(() => {
    var content = data;

    if (term !== null) {
      content = content.filter((swtd) => swtd?.term.id === term?.id);
    }

    if (selectedStatus !== "") {
      content = content.filter((swtd) => swtd.validation.status.toLowerCase() === selectedStatus.toLowerCase());
    }

    if (searchQuery !== "") {
      var query = searchQuery.toLowerCase();

      content = content.filter(
        (swtd) => (
          swtd.id.toString().includes(query) ||
          swtd.title.toLowerCase().includes(query) ||
          swtd.points.toString().includes(query)
        )
      );
    }

    onFilter(content);
  }, [term, selectedStatus, searchQuery, data]);

  return (
    <Row className="w-100 d-flex align-items-center mx-0 px-0">
      {/* Search Bar */}
      <Col xs="12" sm="7" md="4" xxl="4" className="text-start mb-3 px-0">
        <InputGroup className={`${styles.searchBar}`}>
          <InputGroup.Text>
            <i className="fa-solid fa-magnifying-glass"></i>
          </InputGroup.Text>
          <Form.Control
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </Col>

      {/* Status Filter */}
      <Col xs="6" sm="6" md="3" xxl="3" className="d-flex align-items-center px-4 me-auto mb-3">
        <Form.Group as={Row} controlId="inputFilter" className="flex-grow-1">
          <Form.Select
            className={styles.cardBody}
            name="filter"
            onChange={(e) => {
              setSelectedStatus(e.target.value);
            }}>
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Action Buttons -> Larger than Mobile */}
      <Col xs="6" sm="5" mb="3" xxl="4" className="d-none d-sm-flex justify-content-end mb-3 px-0">
        <Row className="w-100 d-flex justify-content-end align-items-center">
          <Col sm="5" className="d-flex justify-content-end">
            {term === null && <BtnSecondary onClick={handlePrint}>Export PDF</BtnSecondary>}
          </Col>
          <Col sm="6" className="d-flex justify-content-end">
            <BtnPrimary onClick={() =>user?.department === null ? openModal() : handleAddRecordClick()}>Add a New Record</BtnPrimary>
          </Col>
        </Row>
      </Col>

      {/* Action Buttons -> Mobile */}
      <Col xs="6" className="d-sm-none d-flex justify-content-between mb-3 px-0">
        <Row className="w-100 d-flex justify-content-end align-items-center">
          <Col xs="6" className="d-flex justify-content-end">
            {term === null && <BtnSecondary onClick={handlePrint}><i class="fa-solid fa-download"></i></BtnSecondary>}
          </Col>
          <Col xs="6" className="d-flex justify-content-end">
            <BtnPrimary onClick={() => user?.department === null ? openModal() : handleAddRecordClick()}><i class="fa-solid fa-plus"></i></BtnPrimary>
          </Col>
        </Row>
      </Col>

      <DepartmentRequiredModal show={showModal} onHide={closeModal} />
    </Row>
  );
}