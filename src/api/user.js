import axios from "axios";

export const getUser = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(`http://localhost:5000/users/${data.id}`, {
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
    const response = await axios.get("http://localhost:5000/users/", {
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
      `http://localhost:5000/users/${data.id}`,
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
      `http://localhost:5000/users/${data.id}`,
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
      `http://localhost:5000/users/${data.id}`,
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
      `http://localhost:5000/users/${data.id}/points?term_id=${data.term_id}`,
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
