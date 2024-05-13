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

export const validateSWTD = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.put(
      `http://localhost:5000/swtds/${data.id}/validation`,
      {
        status: data.response,
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
      `http://localhost:5000/terms/`,
      {
        name: data.name,
        start_date: data.start_date,
        end_date: data.end_date,
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

export const getTerms = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.get(`http://localhost:5000/terms/`, {
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
      `http://localhost:5000/users/${data.id}/terms/${data.term_id}`,
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
      `http://localhost:5000/users/${data.id}/terms/${data.term_id}`,
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
