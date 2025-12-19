import axios from "axios";

const createRoom = async function (data) {
  try {
    const res = await axios.post("/api/room/create-room", data, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return {
      status: res.status,
      data: res.data,
      error: null,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      error: error.response?.data || "something went wrong",
    };
  }
};

const getAllRooms = async function (workspaceId) {
  try {
    const res = await axios.get(`/api/room/get-allRooms/${workspaceId}`, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return {
      status: res.status,
      data: res.data,
      error: null,
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      error: error.response?.data || "something went wrong",
    };
  }
};

export { createRoom, getAllRooms };
