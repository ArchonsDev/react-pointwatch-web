import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

export const getComments = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(
      `${apiUrl}/swtds/${data.id}/comments`,
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

export const postComment = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.post(
      `${apiUrl}/swtds/${data.id}/comments`,
      {
        message: data.message,
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

export const editComment = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.put(
      `${apiUrl}/swtds/${data.swtd_id}/comments/${data.comment_id}`,
      {
        message: data.message,
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

export const deleteComment = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/swtds/${data.swtd_id}/comments/${data.comment_id}`,
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
