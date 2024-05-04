import axios from "axios";

export const getAllSWTDs = async (data, onSuccess, onFail) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/swtds/?author_id=${data.author_id}`,
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
      "http://localhost:5000/swtds/",
      {
        author_id: data.author_id,
        title: data.title,
        venue: data.venue,
        category: data.category,
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
      `http://localhost:5000/swtds/${data.form_id}`,
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
      `http://localhost:5000/swtds/${data.form_id}/validation/proof`,
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
      `http://localhost:5000/swtds/${data.form_id}/validation`,
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
      `http://localhost:5000/swtds/${data.id}`,
      {
        title: data.title,
        venue: data.venue,
        category: data.category,
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
