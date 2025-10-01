import { get, post } from "@/modules/shared/api/http";
import { showToast } from "@/modules/shared/utils/toast.js";

export async function createWorkOrder(payload) {
  try {
    return await post("/createwo", payload);
  } catch (err) {
    console.error("createWorkOrder failed:", err);
    throw err;
  }
}

export async function validateWorkOrder(creationData) {
  try {
    const message = await post("/workorderPrevalidations", creationData);

    if (message) {
      showToast(message, "warning", "Warning", true, 5000);
      return false;
    }

    return true;
  } catch (error) {
    console.error("validateWorkOrder failed:", error);
    showToast("Something went wrong while validating work order.", "error");
    return false;
  }
}

export async function searchWorkOrders(payload) {
  // http.post already sets JSON headers from http.js, and returns res.data
  return await post("/searchwo", payload);
}

export async function getOptionsForWorkOrder(workOrderId) {
  return await get(`/${workOrderId}/options`);
}

export function mapApiToCertificateTypes(api) {
  const arr = [];
  if (!api) return arr;
  if (api.isMLCOption) arr.push("MLC");
  if (api.isISMOption) arr.push("ISM");
  if (api.isISPSOption) arr.push("ISPS");
  return arr;
}

// convert array of codes -> API request booleans
export function mapCertificateTypesToApi(certificateArray) {
  return {
    isMLCOption: certificateArray.includes("MLC"),
    isISMOption: certificateArray.includes("ISM"),
    isISPSOption: certificateArray.includes("ISPS"),
  };
}

export async function saveOptionsForWorkOrder(workOrderId, options) {
  try {
    const res = await post(`/${workOrderId}/options`, options);

    // res is whatever the API returns; original code expected res.data.success
    if (res?.success) {
      showToast("Options saved successfully", "success");
    } else {
      // optional: show API-provided message if present
      if (res?.message) showToast(res.message, "warning");
    }

    return res;
  } catch (err) {
    console.error("saveOptionsForWorkOrder failed:", err);
    showToast("Error saving options", "danger");
    throw err; // rethrow so caller can react if needed
  }
}
