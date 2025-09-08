<template>
  <div class="container py-4" style="margin-left: -28px">
    <div class="card p-4 shadow-sm bg-white">
      <ClientSearchAutocomplete
        v-if="!selectedClient"
        :clients="clients"
        @start="handleClientSelected"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import ClientSearchAutocomplete from "@/modules/shared/components/ClientSearchAutocomplete.vue";
import { useClientStore } from "@/modules/customer/customerstore";

const router = useRouter();
const selectedClient = ref(null);
const clientStore = useClientStore();

// dummy test clients
const clients = [
  { id: 2018668, name: "TEST LIMITED" },
  { id: 2021778, name: "TEST Limited (Re-Reg Year 3)" },
  { id: 2005685, name: "TEST  (Hong Kong) Ltd" },
];

const handleClientSelected = (client) => {
  clientStore.setClient(client);
  router.push({ name: "BfaLayout", params: { clientId: client.id } });
};
</script>