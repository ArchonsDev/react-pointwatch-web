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
