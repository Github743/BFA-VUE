import { get, post } from "@/modules/shared/api/http"; // import common get

const ProductsService = {
  getSchedules: async (workOrderId = 0, systemDiscountProgramId = 1) => {
    return await get("/schedules", { workOrderId, systemDiscountProgramId });
  },

  getScheduleProducts: async (systemDiscountScheduleId) => {
    return await get("/schedule-products", { systemDiscountScheduleId });
  },

  getEntityProducts: async (workOrderId) => {
    return await get("/GetEntityProducts", { workOrderId });
  },

  getAdditionalDiscountedProducts: async (workOrderId) => {
    return await get("/AdditionalDiscountedProducts", { workOrderId });
  },

  getDiscountTypes: async () => {
    return await get("/lookupByName", { LookupTypeName: "DiscountType" });
  },

  getProductGroupTypes: async () => {
    return await get("/lookupByName", { LookupTypeName: "ProductGroupType" });
  },

  getProductByName: async (productName) => {
    return await get("/systemproducts-discountbyname", {
      systemProductName: productName,
    });
  },

  getFleetInvoices: async (workOrderId) => {
    return await get("/fleetInvoices", { workOrderId });
  },

  getInvoiceCharges: async (workOrderInvoiceId) => {
    return await get("/woInvoiceItems", { workOrderInvoiceId });
  },

  saveEntityProducts: async (items, workOrderId, systemDiscountScheduleId) => {
    const url = "/SaveEntityProducts";
    const config = {
      params: { workOrderId, systemDiscountScheduleId },
    };
    const response = await post(url, items, config);
    return response;
  },

  updateEntityProduct: async (items) => {
    const url = "/UpdateEntity";
    const response = await post(url, items);
    return response;
  },

  deleteEntityProduct: async (workOrderClientAgreementEntityProductId) => {
    const url = "/RemoveEntity";
    const response = await post(url, workOrderClientAgreementEntityProductId);
    return response;
  },

  deleteAll: async (ids) => {
    const url = "/RemoveEntities";
    const response = await post(url, ids);
    return response;
  },

  saveAdditionalProduct: async (item) => {
    const url = "/SaveProduct";
    const response = await post(url, item);
    return response;
  },
};

export default ProductsService;
