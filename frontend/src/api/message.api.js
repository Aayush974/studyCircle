import { api } from "./axios.config.js";

const createMessage = async function (data) {
  try {
    const res = await api.post("/messages/create-message", data, {
      headers: { "Content-Type": "multipart/form-data" },
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

const getMessage = async function ({ targetId, targetType, limit, before }) {
  try {
    const res = await api.get("/messages/get-message", {
      params: { targetId, targetType, before, limit },
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

export { createMessage, getMessage };
