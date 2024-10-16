import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

export const getAllSWTDs = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.get(
      `${apiUrl}/swtds/?author_id=${data.author_id}`,
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
    const formData = new FormData();
    Object.keys(data).forEach((field) => {
      formData.append(field, data[field]);
    });

    if (data.files && data.files.length > 0) {
      data.files.forEach((file, index) => {
        formData.append(`files`, file);
      });
    }

    const response = await axios.post(`${apiUrl}/swtds/`, formData, {
      headers: {
        Authorization: `Bearer ${data.token}`,
        "Content-Type": "multipart/form-data",
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

export const getSWTD = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(`${apiUrl}/swtds/${data.form_id}`, {
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

export const getSWTDValidation = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(
      `${apiUrl}/swtds/${data.form_id}/validation`,
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
      `${apiUrl}/swtds/${data.id}`,
      {
        author_id: data.author_id,
        title: data.title,
        venue: data.venue,
        category: data.category,
        term_id: data.term_id,
        start_date: data.start_date,
        end_date: data.end_date,
        total_hours: data.total_hours,
        points: data.points,
        benefits: data.benefits,
        has_deliverables: data.has_deliverables,
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

export const deleteSWTD = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.delete(`${apiUrl}/swtds/${data.id}`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
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

export const getProof = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(
      `${apiUrl}/swtds/${data.form_id}/proof?id=${data.proof_id}`,
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

export const addProof = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const formData = new FormData();
    data.files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axios.post(
      `${apiUrl}/swtds/${data.form_id}/proof`,
      formData,
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

export const deleteProof = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/swtds/${data.form_id}/proof?id=${data.proof_id}`,
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
