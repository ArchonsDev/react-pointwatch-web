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
      `${apiUrl}/swtds/${data.id}/validation`,
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
