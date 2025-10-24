import { api } from "./axios.config.js";

const registerUser = async function (data) {
  try {
    const res = await api.post(`/users/register`, data, {
      headers: { "Content-Type": "multipart/form-data" },
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

const loginUser = async function (data) {
  try {
    const res = await api.post(`/users/login`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return {
      status: res.status,
      data: res.data, // reminder: this contains refresh and access token also
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

export { registerUser, loginUser };
