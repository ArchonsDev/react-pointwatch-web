import React, { useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Form, Row, Col, FloatingLabel, Table, Spinner, InputGroup } from "react-bootstrap"; /* prettier-ignore */

import SessionUserContext from "../../contexts/SessionUserContext";
import types from "../../data/types.json";
import { addDepartment, deleteDepartment, getAllDepartments } from "../../api/admin"; /* prettier-ignore */
import { useTrigger } from "../../hooks/useTrigger";
import { useSwitch } from "../../hooks/useSwitch";
import { isEmpty } from "../../common/validation/utils";

import PaginationComponent from "../../components/Paging";
import BtnPrimary from "../../common/buttons/BtnPrimary";
import EditDepartmentModal from "../../common/modals/EditDepartmentModal";
import ConfirmationModal from "../../common/modals/ConfirmationModal";
import styles from "./style.module.css";

const Department = () => {
  const { user } = useContext(SessionUserContext);
  const token = Cookies.get("userToken");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [showModal, openModal, closeModal] = useSwitch();
  const [showEditModal, openEditModal, closeEditModal] = useSwitch();
  const [showDeleteModal, openDeleteModal, closeDeleteModal] = useSwitch();
  const [showSuccess, triggerShowSuccess] = useTrigger(false);
  const [showError, triggerShowError] = useTrigger(false);
  const [showDeleteSuccess, triggerShowDeleteSuccess] = useTrigger(false);
  const [showEditSuccess, triggerShowEditSuccess] = useTrigger(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [customClass, setCustomClass] = useState("");
  const [disable, setDisable] = useState(false);
  const [levels, setLevels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevels, setFilterLevels] = useState([]);
  const [selectedFilterLevel, setSelectedFilterLevel] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [checkbox, setCheckbox] = useState({
    deptName: false,
  });

  const [termCheckbox, setTermCheckbox] = useState({
    semester: false,
    midyear: false,
    academic: false,
  });

  const termMapping = {
    SEMESTER: "semester",
    "MIDYEAR/SUMMER": "midyear",
    "ACADEMIC YEAR": "academic",
  };

  const [form, setForm] = useState({
    name: "",
    level: "",
    required_points: 0,
    midyear_points: 0,
    use_schoolyear: false,
  });

  const fetchDepartments = async () => {
    getAllDepartments(
      {
        token: token,
      },
      (response) => {
        console.log(response.departments);
        setDepartments(response.departments);
        const uniqueLevels = [
          ...new Set(response.departments.map((dept) => dept.level)),
        ];
        setLevels(uniqueLevels);
        setFilterLevels(uniqueLevels);
        setLoading(false);
      },
      (error) => {
        console.log(error.message);
      }
    );
  };

  const invalidFields = () => {
    const requiredFields = ["name", "level"];
    return (
      requiredFields.some((field) => isEmpty(form[field])) ||
      form?.required_points <= 0
    );
  };

  const handleBoxChange = (e) => {
    const { id, checked } = e.target;
    setCheckbox({
      ...checkbox,
      [id]: checked,
    });

    const updatedTermCheckbox = {
      ...termCheckbox,
      semester: id === "SEMESTER" ? checked : termCheckbox.semester,
      midyear: id === "MIDYEAR/SUMMER" ? checked : termCheckbox.midyear,
      academic: id === "ACADEMIC YEAR" ? checked : termCheckbox.academic,
    };

    const checkedCount =
      Object.values(updatedTermCheckbox).filter(Boolean).length;
    setTermCheckbox(updatedTermCheckbox);
    setDisable(checkedCount >= 2);

    setForm((prevForm) => ({
      ...prevForm,
      name: id === "deptName" ? (checked ? prevForm.level : "") : prevForm.name,
      use_schoolyear:
        id === "ACADEMIC YEAR" ? checked : prevForm.use_schoolyear,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]:
        name === "required_points" || name === "midyear_points"
          ? parseInt(value, 10) || 0
          : value,
    }));
  };

  const clearForm = () => {
    setForm({
      name: "",
      level: "",
      required_points: 0,
      midyear_points: 0,
      use_schoolyear: false,
    });

    setCheckbox({
      deptName: false,
    });

    setTermCheckbox({
      semester: false,
      midyear: false,
      academic: false,
    });

    setSelectedLevel("");
    setCustomClass("");
  };

  const handleSubmit = async () => {
    await addDepartment(
      {
        ...form,
        token: token,
      },
      (response) => {
        triggerShowSuccess(3000);
        setDisable(false);
        fetchDepartments();
        clearForm();
      },
      (error) => {
        setErrorMessage(error.message);
        triggerShowError(3000);
      }
    );
  };

  const handleDelete = () => {
    deleteDepartment(
      {
        id: selectedDepartment.id,
        token: token,
      },
      (response) => {
        triggerShowDeleteSuccess(4500);
        fetchDepartments();
      },
      (error) => {
        setErrorMessage(error.message);
        triggerShowError(3000);
      }
    );
  };

  const editSuccess = async () => {
    triggerShowEditSuccess(3000);
    await fetchDepartments();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilter = (deptList, query, level) => {
    return deptList.filter((dept) => {
      const matchesQuery = query
        ? dept.name.toLowerCase().includes(query?.toLowerCase())
        : true;
      const matchesLevel = level ? dept.level === level : true;
      return matchesQuery && matchesLevel;
    });
  };

  //Filtered SWTDs with search bar & dropdown
  const filteredDepartments = handleFilter(
    departments,
    searchQuery,
    selectedFilterLevel
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilterLevel]);

  // Sets the departments to render
  const depts =
    filteredDepartments && filteredDepartments.length > 0
      ? filteredDepartments
      : departments;

  // Calculate pagination
  const totalRecords = depts.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = depts.slice(indexOfFirstRecord, indexOfLastRecord);

  useEffect(() => {
    if (selectedLevel !== "Other") {
      setForm({
        ...form,
        level: selectedLevel,
      });
    }
  }, [selectedLevel]);

  useEffect(() => {
    if (customClass) {
      setForm({
        ...form,
        level: customClass,
      });
    }
  }, [customClass]);

  useEffect(() => {
    if (checkbox.deptName) {
      setForm((prevForm) => ({
        ...prevForm,
        name: selectedLevel === "Other" ? customClass : selectedLevel,
      }));
    }
  }, [selectedLevel, customClass, checkbox.deptName]);

  useEffect(() => {
    if (!termCheckbox.midyear) {
      setForm((prevForm) => ({
        ...prevForm,
        midyear_points: 0,
      }));
    }
  }, [termCheckbox.midyear]);

  useEffect(() => {
    if (!user?.is_staff && !user?.is_superuser) {
      navigate("/swtd");
    }
    fetchDepartments();
  }, [user]);

  return (
    <>
      <Form className={styles.form}>
        {showError && (
          <div className="alert alert-danger mb-3" role="alert">
            {errorMessage}
          </div>
        )}

        {showSuccess && (
          <div className="alert alert-success mb-3" role="alert">
            Department added.
          </div>
        )}

        <Row className="mb-2">
          <Col className={`p-1 ${styles.formSection}`}>
            <span className="ms-1">GENERAL INFORMATION</span>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col lg={6} md={6}>
            <FloatingLabel controlId="floatingSelectLevel" label="Level">
              <Form.Select
                className={styles.formBox}
                name="level"
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                }}
                value={selectedLevel}>
                <option value="" disabled>
                  Select a level
                </option>
                {levels.map((cl, index) => (
                  <option key={index} value={cl}>
                    {cl}
                  </option>
                ))}
                <option value="Other">Add New</option>
              </Form.Select>
            </FloatingLabel>
          </Col>

          {selectedLevel === "Other" && (
            <Col>
              <FloatingLabel controlId="floatingInputOther" label="Other Level">
                <Form.Control
                  className={styles.formBox}
                  onChange={(e) => {
                    setCustomClass(e.target.value);
                  }}
                  value={customClass}
                />
              </FloatingLabel>
              <Form.Text>
                Ex. Elementary, Junior High School, College of Arts, Sciences,
                and Education, etc...
              </Form.Text>
            </Col>
          )}
        </Row>

        {/* CHECKBOX */}
        <Row className="w-100 mb-3">
          <Col lg="auto" md={12} xs={12}>
            <Form.Check
              inline
              type="checkbox"
              id="deptName"
              checked={checkbox.deptName}
              onChange={handleBoxChange}
            />
            <Form.Check.Label className="me-lg-5 me-0">
              Use level as department name.
            </Form.Check.Label>
          </Col>
        </Row>

        <Row>
          <Col>
            <FloatingLabel
              controlId="floatingInputName"
              label="Department/Office Name"
              className="mb-3">
              <Form.Control
                className={styles.formBox}
                name="name"
                onChange={handleChange}
                value={form.name}
                disabled={checkbox.deptName}
              />
            </FloatingLabel>
          </Col>
        </Row>

        <Row className="mb-2">
          <Col className={`p-1 ${styles.formSection}`}>
            <span className="ms-1">POINTS REQUIREMENT</span>
          </Col>
        </Row>

        {/* CHECKBOX */}
        <Row className="mb-3">
          <Col className="me-3" md="auto">
            <Form.Label className={`${styles.formLabel}`}>Term Type</Form.Label>
          </Col>
          <Col>
            {types.type.map((item, index) => {
              const isDisabled = disable && !termCheckbox[termMapping[item]];
              return (
                <Form.Check
                  key={index}
                  type="checkbox"
                  name="type"
                  className="me-4"
                  label={item}
                  id={item}
                  checked={termCheckbox[termMapping[item]]}
                  onChange={handleBoxChange}
                  inline
                  disabled={isDisabled}
                />
              );
            })}
          </Col>
        </Row>

        <Row>
          <Col md={3}>
            <FloatingLabel
              controlId="floatingInputPoints"
              label="Required Points"
              className="mb-3">
              <Form.Control
                type="number"
                min={0}
                className={styles.formBox}
                name="required_points"
                onChange={handleChange}
                value={form.required_points}
              />
            </FloatingLabel>
          </Col>

          <Col md={3}>
            <FloatingLabel
              controlId="floatingInputMidyearPoints"
              label="Midyear Points"
              className="mb-3">
              <Form.Control
                type="number"
                min={0}
                className={styles.formBox}
                name="midyear_points"
                onChange={handleChange}
                value={form.midyear_points}
                disabled={!termCheckbox.midyear}
              />
            </FloatingLabel>
          </Col>
        </Row>

        <Row>
          <Col className="text-end">
            <BtnPrimary
              onClick={openModal}
              disabled={invalidFields()}
              title={invalidFields() ? "All fields are required." : ""}>
              Add Department
            </BtnPrimary>
          </Col>
          <ConfirmationModal
            show={showModal}
            onHide={closeModal}
            onConfirm={handleSubmit}
            header={"Add Department"}
            message={"Do you wish to add this department?"}
          />
        </Row>
      </Form>

      <hr />

      <Row className={`${styles.table} w-100`}>
        {showDeleteSuccess && (
          <div className="alert alert-success mb-3" role="alert">
            Department deleted.
          </div>
        )}

        {showEditSuccess && (
          <div
            className={`${styles.form} alert alert-success mb-3`}
            role="alert">
            Department details updated.
          </div>
        )}
        <Row className="w-100">
          {/* SEARCH BAR */}
          <Col lg={8}>
            <InputGroup className={`${styles.searchBar} mb-3`}>
              <InputGroup.Text>
                <i className="fa-solid fa-magnifying-glass"></i>
              </InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="Search by department/office name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Col>

          {/* FILTER LEVEL */}
          <Col lg={4}>
            <Form.Select
              className={styles.formBox}
              name="filter_level"
              onChange={(e) => {
                setSelectedFilterLevel(e.target.value);
              }}
              value={selectedFilterLevel}>
              <option value="">All levels</option>
              {filterLevels.map((lev, index) => (
                <option key={index} value={lev}>
                  {lev}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {loading ? (
          <Row
            className={`${styles.loading} d-flex justify-content-center align-items-center w-100`}>
            <Spinner className={`me-2`} animation="border" />
            Loading departments...
          </Row>
        ) : (
          <>
            {currentRecords.length === 0 ? (
              <Row className="d-flex justify-content-center align-items-center mt-3 mb-3 w-100">
                <span className={`${styles.table}`}>No departments found.</span>
              </Row>
            ) : (
              <>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th className="col-3">Level</th>
                      <th>Department/Office Name</th>
                      <th className="col-2">Term Type</th>
                      <th className="text-center col-1">Required Points</th>
                      <th className="text-center col-1">Midyear Points</th>
                      <th className="text-center col-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords
                      .sort((a, b) => a.level - b.level)
                      .map((department) => (
                        <tr key={department.id}>
                          <td>{department.level}</td>
                          <td>{department.name}</td>
                          <td>
                            {department.use_schoolyear
                              ? "ACADEMIC YEAR"
                              : "SEMESTER"}
                            <br />
                            {department.midyear_points === 0
                              ? ""
                              : "MIDYEAR/SUMMER"}
                          </td>
                          <td className="text-center">
                            {department.required_points}
                          </td>
                          <td className="text-center">
                            {department.midyear_points}
                          </td>
                          <td className="text-center">
                            <i
                              className={`${styles.icon} fa-solid fa-pen-to-square fa-lg text-dark me-3`}
                              onClick={() => {
                                setSelectedDepartment(department);
                                openEditModal();
                              }}></i>
                            <i
                              className={`${styles.icon} fa-solid fa-trash-can fa-lg text-danger`}
                              onClick={() => {
                                setSelectedDepartment(department);
                                openDeleteModal();
                              }}></i>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <EditDepartmentModal
                    show={showEditModal}
                    onHide={closeEditModal}
                    data={selectedDepartment}
                    editSuccess={editSuccess}
                  />
                  <ConfirmationModal
                    show={showDeleteModal}
                    onHide={closeDeleteModal}
                    onConfirm={handleDelete}
                    header={"Delete Department?"}
                    message={"This action is irreversible."}
                  />
                </Table>
                <Row className="w-100 mb-3">
                  <Col className="d-flex justify-content-center">
                    <PaginationComponent
                      totalPages={totalPages}
                      currentPage={currentPage}
                      handlePageChange={handlePageChange}
                    />
                  </Col>
                </Row>
              </>
            )}
          </>
        )}
      </Row>
    </>
  );
};

export default Department;
