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
      // using axios here and not api since have to use vite's proxy here, else the cookie is not being set in the browser
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

const logoutUser = async () => {
  try {
    const res = await api.post(
      "/users/logout",
      {}, // empty data since logout is cookie based
      {
        withCredentials: true,
      }
    );
    return {
      status: res.status,
      data: res.data,
      error: null,
    };
  } catch (error) {
    return {
      status: error.response?.status || 400,
      data: null,
      error: error.response?.data || "something went wrong",
    };
  }
};

const getCurrentUser = async () => {
  try {
    const res = await api.get(`/users/get-current-user`, {
      withCredentials: true,
    });
    return {
      status: res.status,
      data: res.data,
      error: null,
    };
  } catch (error) {
    return {
      status: error.response?.status || 400,
      data: null,
      error: error.response?.data || "something went wrong",
    };
  }
};

const sendVerificationEmail = async () => {
  try {
    const res = await api.get(`/users/send-verification-email`, {
      withCredentials: true,
    });
    return {
      status: res.status,
      data: res.data,
      error: null,
    };
  } catch (error) {
    return {
      status: error.response?.status || 400,
      data: null,
      error: error.response?.data || "something went wrong",
    };
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  sendVerificationEmail,
  getCurrentUser,
};
