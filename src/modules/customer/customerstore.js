import { defineStore } from "pinia";

export const useClientStore = defineStore("client", {
  state: () => ({
    selectedClient: null,
  }),
  actions: {
    setClient(client) {
      this.selectedClient = client;
    },
    clearClient() {
      this.selectedClient = null;
    },
    },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "client-store",
        storage: localStorage,
      },
    ],
  },
});
