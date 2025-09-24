import { defineStore } from "pinia";

export const useBfaStore = defineStore("bfa-option", {
  state: () => ({
    systemDiscountScheduleName: "",
    workOrderClientAgreementId: 0,
  }),
  actions: {
    setSystemDiscountScheduleName(value) {
      this.systemDiscountScheduleName = value ?? "";
    },
    setWorkOrderClientAgreementId(value) {
      this.workOrderClientAgreementId = value;
    },
    clearSystemDiscountScheduleName() {
      this.systemDiscountScheduleName = "";
    },
    clearWorkOrderClientAgreementId() {
      this.workOrderClientAgreementId = 0;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "bfa-optionstore",
        storage: localStorage,
      },
    ],
  },
});
