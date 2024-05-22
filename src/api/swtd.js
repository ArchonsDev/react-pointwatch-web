import axios from "axios";
import config from "../config";

export const getAllSWTDs = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.get(
      `${config.apiUrl}/swtds/?author_id=${data.author_id}`,
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

export const addSWTD = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.post(
      `${config.apiUrl}/swtds/`,
      {
        author_id: data.author_id,
        title: data.title,
        venue: data.venue,
        category: data.category,
        term_id: data.term_id,
        role: data.role,
        date: data.date,
        time_started: data.time_started,
        time_finished: data.time_finished,
        points: data.points,
        proof: data.proof,
        benefits: data.benefits,
      },
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
          "Content-Type": "multipart/form-data",
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

export const getSWTD = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(
      `${config.apiUrl}/swtds/${data.form_id}`,
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

export const getSWTDProof = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(
      `${config.apiUrl}/swtds/${data.form_id}/validation/proof`,
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
        responseType: "arraybuffer",
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

export const getSWTDValidation = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(
      `${config.apiUrl}/swtds/${data.form_id}/validation`,
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

export const editSWTD = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.put(
      `${config.apiUrl}/swtds/${data.id}`,
      {
        title: data.title,
        venue: data.venue,
        category: data.category,
        term_id: data.term_id,
        role: data.role,
        date: data.date,
        time_started: data.time_started,
        time_finished: data.time_finished,
        points: data.points,
        benefits: data.benefits,
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

export const editProof = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.put(
      `${config.apiUrl}/swtds/${data.id}/validation/proof`,
      {
        proof: data.proof,
      },
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
          "Content-Type": "multipart/form-data",
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

export const deleteSWTD = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.delete(
      `${config.apiUrl}/swtds/${data.id}`,
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
