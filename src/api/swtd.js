import axios from "axios";

// hello! do the GET request here to get the logged in user's SWTDs :D
// insert a record through the Add a Record Page (it works now! <3)

// this is mine. add your call before or after mine. DO NOT modify this. ty
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
