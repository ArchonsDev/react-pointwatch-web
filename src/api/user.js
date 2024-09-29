import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

export const getUser = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(`${apiUrl}/users/${data.id}`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    if (response.status === 200) {
      onSuccess && onSuccess(response);
    }
  } catch (error) {
    onFail && onFail(error);
  } finally {
    onCleanup && onCleanup();
  }
};

export const getAllUsers = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(`${apiUrl}/users/`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      onSuccess && onSuccess(response);
    }
  } catch (error) {
    onFail && onFail(error);
  } finally {
    onCleanup && onCleanup();
  }
};

export const updateUser = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.put(
      `${apiUrl}/users/${data.id}`,
      {
        employee_id: data.employee_id,
        firstname: data.firstname,
        lastname: data.lastname,
        department: data.department,
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

export const updatePassword = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.put(
      `${apiUrl}/users/${data.id}`,
      {
        password: data.password,
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

export const deleteUser = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/users/${data.id}`,
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

export const userPoints = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(
      `${apiUrl}/users/${data.id}/points?term_id=${data.term_id}`,
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
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

export const getClearanceStatus = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.get(
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
