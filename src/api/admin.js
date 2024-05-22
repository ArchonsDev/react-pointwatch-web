import axios from "axios";
import config from "../config.json";

export const getAllUsers = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.get(`${config.apiUrl}/users/`, {
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
      `${config.apiUrl}/swtds/${data.id}/validation`,
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
      `${config.apiUrl}/terms/`,
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
      `${config.apiUrl}/terms/${data.id}`,
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
    const response = await axios.delete(`${config.apiUrl}/terms/${data.id}`, {
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
    const response = await axios.get(`${config.apiUrl}/terms/`, {
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
      `${config.apiUrl}/users/${data.id}/terms/${data.term_id}`,
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
      `${config.apiUrl}/users/${data.id}/terms/${data.term_id}`,
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
