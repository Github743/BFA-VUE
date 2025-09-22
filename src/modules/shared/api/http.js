import axios from "axios";

// Create axios instance with a base URL
const api = axios.create({
  baseURL: "https://localhost:7020/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// GET wrapper
export const get = async (url, params = {}) => {
  try {
    const res = await api.get(url, { params });
    return res.data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

// POST wrapper
export const post = async (url, data = {}, config = {}) => {
  try {
    const res = await api.post(url, data, config);
    return res.data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

// PUT wrapper
export const put = async (url, data = {}) => {
  try {
    const res = await api.put(url, data);
    return res.data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

// DELETE wrapper
export const del = async (url) => {
  try {
    const res = await api.delete(url);
    return res.data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

// Simple centralized error handler
function handleError(error) {
  if (error.response) {
    console.error("API error:", error.response.status, error.response.data);
  } else if (error.request) {
    console.error("API no response:", error.request);
  } else {
    console.error("API setup error:", error.message);
  }
}
