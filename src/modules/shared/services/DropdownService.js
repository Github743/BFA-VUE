import { get, post } from "@/modules/shared/api/http";

const DropdownService = {
  // Get Discounted schedules
  getSchedules: async (workOrderId = 0, systemDiscountProgramId = 1) => {
    return await get("/schedules", { workOrderId, systemDiscountProgramId });
  },

  // Get Scheduled products for the selected discounted
  getScheduleProducts: async (systemDiscountScheduleId) => {
    return await get("/schedule-products", { systemDiscountScheduleId });
  },

  // Get discount types
  getDiscountTypes: async () => {
    return await get("/lookupByName", { LookupTypeName: "DiscountType" });
  },
};

export default DropdownService;
