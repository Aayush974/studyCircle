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

export { getUserWorkspaces };
