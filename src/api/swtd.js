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
    const response = await axios.post(
      `${apiUrl}/swtds/`,
      {
        author_id: data.author_id,
        title: data.title,
        venue: data.venue,
        category: data.category,
        term_id: data.term_id,
        role: data.role,
        dates: data.dates,
        points: data.points,
        proof: data.proof,
        benefits: data.benefits,
        has_deliverables: data.has_deliverables,
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

export const getSWTDProof = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(
      `${apiUrl}/swtds/${data.form_id}/validation/proof`,
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
        role: data.role,
        dates: data.dates,
        points: data.points,
        proof: data.proof,
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

export const editProof = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.put(
      `${apiUrl}/swtds/${data.id}/validation/proof`,
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
