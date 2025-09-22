<template>
  <div class="container py-4" style="margin-left: -28px">
    <div class="card p-4 shadow-sm bg-white">
      <!-- Search: hide its internal Start button via prop -->
      <ClientSearchAutocomplete
        v-show="!selectedClient"
        :clients="clients"
        :loading="loadingClients"
        :show-start="false"
        @select="onSelect"
        @search="onSearch"
      />

      <!-- Show details (inside same card) when a client is selected -->
      <ClientDetails
        v-if="selectedClient"
        :client="selectedClient"
        :loading="creatingWorkOrder"
      />

      <!-- START button area (always present beneath details / search) -->
      <div class="d-flex justify-content-end mt-3">
        <button
          class="btn btn-primary"
          :disabled="!selectedClient || creatingWorkOrder"
          @click="startFromSelected"
        >
          Start
        </button>
      </div>
    </div>
    <LoadingOverlay :visible="creatingWorkOrder" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import ClientSearchAutocomplete from "@/modules/shared/components/ClientSearchAutocomplete.vue";
import ClientDetails from "@/modules/customer/ClientDetail.vue";
import { useClientStore } from "@/modules/customer/customerstore";
import { fetchCustomers } from "@/modules/customer/customerApi";
import { createWorkOrder } from "@/modules/workorder/workorderApi";
import { showToast } from "@/modules/shared/utils/toast.js";
import LoadingOverlay from "../shared/components/LoadingOverlay.vue";

const router = useRouter();
const selectedClient = ref(null);
const clientStore = useClientStore();

const clients = ref([]);
const loadingClients = ref(false);
const creatingWorkOrder = ref(false);
const error = ref(null);

let searchTimer = null;
const debounceMs = 350;

async function loadClients(search = "") {
  loadingClients.value = true;
  error.value = null;

  try {
    const res = await fetchCustomers(search);

    if (Array.isArray(res)) {
      clients.value = res;
    } else if (Array.isArray(res?.items)) {
      clients.value = res.items;
    } else if (Array.isArray(res?.data)) {
      clients.value = res.data;
    } else {
      clients.value = [];
    }
  } catch (err) {
    error.value = err;
    clients.value = [];
  } finally {
    loadingClients.value = false;
  }
}

function onSearch(query) {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    loadClients(query);
  }, debounceMs);
}

function onSelect(client) {
  selectedClient.value = client;
  clientStore.setClient(client);
}

const startFromSelected = async () => {
  if (!selectedClient.value) return;
  await handleClientSelected(selectedClient.value);
};

const handleClientSelected = async (client) => {
  try {
    creatingWorkOrder.value = true;
    clientStore.setClient(client);
    selectedClient.value = client;

    const payload = {
      entities: [{ clientId: client.clientId ?? client.id }],
    };

    const created = await createWorkOrder(payload);

    const workOrderId = String(created.workOrderId);

    if (!workOrderId || workOrderId === "0") {
      throw new Error(
        "Could not determine created work order id from response."
      );
    }

    showToast("Work order created successfully.", "success");
    await router.push({
      name: "BfaStepper",
      params: { step: "options", workOrderId: workOrderId },
    });
  } catch (err) {
    const serverMsg = err?.response?.data?.message || err?.message;
    showToast(serverMsg || "Something went wrong! Please try again.", "danger");
  } finally {
    creatingWorkOrder.value = false;
  }
};
</script>
