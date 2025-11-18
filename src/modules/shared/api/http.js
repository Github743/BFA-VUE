import axios from "axios";

// Create axios instance with a base URL
const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://archerfish-dev.liscr.com/bfa/api"
      : "https://localhost:7020/api",
  headers: {
    "Content-Type": "application/json",
  },
});


// Response interceptor to unwrap ApiResponseDTO
api.interceptors.response.use(
  (response) => {
    // Check if response is wrapped in ApiResponseDTO format
    if (response.data && typeof response.data === 'object') {
      // Check for both PascalCase (Success, Data) and camelCase (success, data)
      const hasSuccess = 'Success' in response.data || 'success' in response.data;
      const hasData = 'Data' in response.data || 'data' in response.data;
      
      if (hasSuccess && hasData) {
        // Handle both PascalCase and camelCase
        const success = response.data.Success ?? response.data.success;
        const data = response.data.Data ?? response.data.data;
        const errorMessage = response.data.ErrorMessage ?? response.data.errorMessage;
        
        if (success) {
          // Unwrap successful response - extract data
          response.data = data;
        } else {
          // Handle API-level failure
          const error = new Error(errorMessage || 'API request failed');
          error.response = response;
          throw error;
        }
      }
    }
    return response;
  },
  (error) => {
    // Handle HTTP errors
    if (error.response && error.response.data) {
      // If error response has ApiResponseDTO structure (both cases)
      const errorMessage = error.response.data.ErrorMessage 
        || error.response.data.errorMessage;
      
      if (errorMessage) {
        error.message = errorMessage;
      }
    }
    return Promise.reject(error);
  }
);

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

// // Simple centralized error handler
// function handleError(error) {
//   if (error.response) {
//     console.error("API error:", error.response.status, error.response.data);
//   } else if (error.request) {
//     console.error("API no response:", error.request);
//   } else {
//     console.error("API setup error:", error.message);
//   }
// }

// Error handler with safe property access
function handleError(error) {
  if (error?.response) {
    console.error("API error:", error.response?.status, error.response?.data);
  } else if (error?.request) {
    console.error("API no response:", error.request);
  } else {
    console.error("API setup error:", error?.message || error);
  }
}
