import axios from "axios";
import { showToast } from "@/modules/shared/utils/toast.js";

export async function createWorkOrder(payload) {
  try {
    const url = "https://archerfish-dev.liscr.com/bfa/api/createwo";
    const res = await axios.post(url, payload);
    return res.data;
  } catch (err) {
    console.error("createWorkOrder failed:", err);
    throw err;
  }
}

export async function searchWorkOrders(payload) {
  try {
    const url = "https://archerfish-dev.liscr.com/bfa/api/searchwo";

    const res = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    if (err?.response) {
      console.error(
        "searchWorkOrders server error:",
        err.response.status,
        err.response.data
      );
    } else if (err?.request) {
      console.error("searchWorkOrders no response (request):", err.request);
    } else {
      console.error("searchWorkOrders error:", err.message);
    }
    throw err;
  }
}

export async function getOptionsForWorkOrder(workOrderId) {
  const res = await axios.get(
    `https://archerfish-dev.liscr.com/bfa/api/${workOrderId}/options`
  );
  return res.data;
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
    const url = `https://archerfish-dev.liscr.com/bfa/api/${workOrderId}/options`;
    const res = await axios.post(url, options);
    console.log(res.data);
    if (res.data.success) {
      showToast("Options saved successfully", "success");
    }
    return res.data;
  } catch (err) {
    showToast("Error saving options", "danger");
  }
}
