import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

export const getAllMembers = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(`${apiUrl}/departments/${data.id}`, {
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
