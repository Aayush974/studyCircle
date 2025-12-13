import axios from "axios";

const getUserWorkspaces = async function (userId) {
  try {
    const res = await axios.get(`/api/workspace/get-user/workspaces`, {
      params: { userId },
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

const createWorkspace = async function (data) {
  try {
    const res = await axios.post("/api/workspace/create-workspace", data, {
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

const searchWorkspace = async function (name) {
  try {
    const res = await axios.get("/api/workspace/search", {
      params: { name },
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

const joinWorkspace = async function (data) {
  try {
    const res = await axios.post("/api/workspace/join-workspace", data, {
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

const fetchWorkspace = async function (id) {
  try {
    const res = await axios.get(`/api/workspace/get-workspace/${id}`, {
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

export {
  getUserWorkspaces,
  createWorkspace,
  searchWorkspace,
  joinWorkspace,
  fetchWorkspace,
};
