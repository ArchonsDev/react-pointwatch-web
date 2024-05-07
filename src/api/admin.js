import axios from "axios";

export const getAllUsers = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.get(`http://localhost:5000/users/`, {
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
