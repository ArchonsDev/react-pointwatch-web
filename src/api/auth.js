import axios from "axios";

export const register = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/auth/register",
      {
        employee_id: data.employee_id,
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        password: data.password,
        department: data.department,
      },
      {
        headers: {
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

export const login = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/auth/login",
      {
        email: data.email,
        password: data.password,
      },
      {
        headers: {
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

export const recovery = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/auth/recovery",
      {
        email: data.email,
      },
      {
        headers: {
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

export const reset = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.post(
      `http://localhost:5000/auth/resetpassword?token=${data.token}`,
      {
        password: data.password,
      },
      {
        headers: {
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

// export const getAccount = async (onSuccess) => {
//   axios
//     .get("http://localhost:5000/auth/microsoft", { maxRedirects: 0 })
//     .then((response) => {
//       onSuccess && onSuccess(response);
//     })
//     .catch((error) => {
//       if (error.response && error.response.status === 302) {
//         const redirectUrl = error.response.headers.location;
//         window.location.href = redirectUrl;
//       } else {
//         console.error("Error:", error);
//       }
//     });
// };
