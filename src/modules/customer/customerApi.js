import {get} from "@/modules/shared/api/http";

export async function fetchCustomers(search = "") {
  try {
    // This returns res.data directly because get() already extracts it
    return await get("/clients", { clientSearch: search });
  } catch (err) {
    console.error("Failed to fetch customers:", err);
    throw err; // rethrow so component can handle it
  }
}
