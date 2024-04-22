import axios from "axios";

export const getUser = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/users/?email=${data.email}`,
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
        firstname: data.firstname,
        lastname: data.lastname,
        password: data.password,
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
