import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

export const getAllUsers = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.get(`${apiUrl}/users/`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    if (response.status === 200) {
      onSuccess && onSuccess(response.data);
    }
  } catch (error) {
    onFail && onFail(error);
  }
};

export const validateSWTD = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.put(
      `${apiUrl}/swtds/${data.id}`,
      {
        validator_id: data.validator_id,
        validation_status: data.validation_status,
      },
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      }
    );

    if (response.status === 200) {
      onSuccess && onSuccess(response.data);
    }
  } catch (error) {
    onFail && onFail(error);
  }
};

export const addTerm = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.post(
      `${apiUrl}/terms/`,
      {
        name: data.name,
        start_date: data.start_date,
        end_date: data.end_date,
        type: data.type,
      },
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      onSuccess && onSuccess(response.data);
    }
  } catch (error) {
    onFail && onFail(error);
  }
};

export const updateTerm = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.put(
      `${apiUrl}/terms/${data.id}`,
      {
        name: data.name,
        start_date: data.start_date,
        end_date: data.end_date,
        type: data.type,
      },
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      onSuccess && onSuccess(response.data);
    }
  } catch (error) {
    onFail && onFail(error);
  }
};

export const deleteTerm = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.delete(`${apiUrl}/terms/${data.id}`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    if (response.status === 200) {
      onSuccess && onSuccess(response.data);
    }
  } catch (error) {
    onFail && onFail(error);
  }
};

export const getTerms = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.get(`${apiUrl}/terms/`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    if (response.status === 200) {
      onSuccess && onSuccess(response.data);
    }
  } catch (error) {
    onFail && onFail(error);
  }
};

export const clearEmployee = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.post(
      `${apiUrl}/users/${data.id}/terms/${data.term_id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      }
    );

    if (response.status === 200) {
      onSuccess && onSuccess(response.data);
    }
  } catch (error) {
    onFail && onFail(error);
  }
};

export const revokeEmployee = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/users/${data.id}/terms/${data.term_id}`,
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      }
    );

    if (response.status === 200) {
      onSuccess && onSuccess(response.data);
    }
  } catch (error) {
    onFail && onFail(error);
  }
};

export const addHead = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.put(
      `${apiUrl}/departments/${data.id}`,
      {
        head_id: data.head_id,
      },
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      onSuccess && onSuccess(response);
    }
  } catch (error) {
    onFail && onFail(error);
  } finally {
    onCleanup && onCleanup();
  }
};

export const removeHead = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.put(
      `${apiUrl}/departments/${data.id}`,
      {
        remove_head: true,
      },
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      onSuccess && onSuccess(response);
    }
  } catch (error) {
    onFail && onFail(error);
  } finally {
    onCleanup && onCleanup();
  }
};

export const updateStaff = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.put(
      `${apiUrl}/users/${data.id}`,
      {
        access_level: data.access_level,
      },
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      onSuccess && onSuccess(response);
    }
  } catch (error) {
    onFail && onFail(error);
  } finally {
    onCleanup && onCleanup();
  }
};

export const addDepartment = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.post(
      `${apiUrl}/departments/`,
      {
        level: data.level,
        name: data.name,
        use_schoolyear: data.use_schoolyear,
        required_points: data.required_points,
        midyear_points: data.midyear_points,
      },
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      onSuccess && onSuccess(response.data);
    }
  } catch (error) {
    onFail && onFail(error);
  }
};

export const getAllDepartments = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.get(`${apiUrl}/departments/`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    if (response.status === 200) {
      onSuccess && onSuccess(response.data);
    }
  } catch (error) {
    onFail && onFail(error);
  }
};

export const getDepartment = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(
      `${apiUrl}/departments/${data.department_id}`,
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      onSuccess && onSuccess(response);
    }
  } catch (error) {
    onFail && onFail(error);
  } finally {
    onCleanup && onCleanup();
  }
};

export const deleteDepartment = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.delete(`${apiUrl}/departments/${data.id}`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    if (response.status === 200) {
      onSuccess && onSuccess(response.data);
    }
  } catch (error) {
    onFail && onFail(error);
  }
};

export const updateDepartment = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.put(
      `${apiUrl}/departments/${data.id}`,
      {
        level: data.level,
        name: data.name,
        use_schoolyear: data.use_schoolyear,
        required_points: data.required_points,
        midyear_points: data.midyear_points,
      },
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      onSuccess && onSuccess(response.data);
    }
  } catch (error) {
    onFail && onFail(error);
  }
};
