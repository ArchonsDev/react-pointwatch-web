import axios from "axios";
import config from "../config.json";

export const exportSWTDList = async (data, onSuccess, onFail, onCleanup) => {
  try {
    const response = await axios.get(
      `${config.apiUrl}/users/${data.id}/swtds/export`,
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
      `${config.apiUrl}/users/${data.id}/validations/export`,
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
      `${config.apiUrl}/users/${data.id}/clearings/export`,
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
