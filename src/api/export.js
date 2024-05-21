import axios from "axios";

export const exportSWTDList = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/users/${data.id}/swtds/export`,
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

export const exportStaffReport = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/users/${data.id}/validations/export`,
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

export const exportAdminReport = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/users/${data.id}/clearings/export`,
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
