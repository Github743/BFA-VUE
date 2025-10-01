<template>
  <div class="invoices-container position-relative">
    <LoadingOverlay :visible="loadingInvoices" />
    <!-- Global overlay while invoices are loading -->
    <table class="table table-bordered table-hover mb-0">
      <thead class="table-light">
        <tr>
          <th style="width: 40px"></th>
          <th>Vessel</th>
          <th>Invoice Number</th>
          <th>Bill To Client</th>
          <th>Billing Address</th>
          <th class="text-end">Discount</th>
          <th class="text-end">Net Amount</th>
          <th>Notes</th>
        </tr>
      </thead>

      <tbody>
        <template v-for="inv in invoices" :key="inv.workOrderInvoiceId">
          <!-- summary row -->
          <tr class="align-middle summary-row">
            <td class="text-center pe-0">
              <button
                class="btn btn-sm btn-link p-0"
                @click="toggleExpand(inv.workOrderInvoiceId)"
                :aria-expanded="isExpanded(inv.workOrderInvoiceId)"
              >
                <i
                  class="bi"
                  :class="
                    isExpanded(inv.workOrderInvoiceId)
                      ? 'bi-caret-down-fill'
                      : 'bi-caret-right-fill'
                  "
                ></i>
              </button>
            </td>

            <td>{{ inv.workOrderVesselName }}</td>
            <td>{{ inv.workOrderVesselOfficialNo }}</td>
            <td>{{ inv.clientName }}</td>
            <td>{{ inv.billingAddressFormatted }}</td>
            <td class="text-end">{{ formatCurrency(inv.discount) }}</td>
            <td class="text-end">{{ formatCurrency(inv.balance) }}</td>
            <td>
              <button
                class="btn btn-sm btn-outline-secondary"
                @click="openNote(inv.workOrderInvoiceId)"
              >
                ✎ Add Note
              </button>
            </td>
          </tr>

          <!-- details row -->
          <tr class="details-row">
            <td class="p-0 border-0"></td>

            <td :colspan="7" class="p-0 border-top-0">
              <transition name="slide-vert">
                <div
                  v-show="isExpanded(inv.workOrderInvoiceId)"
                  class="details-panel p-3 position-relative"
                  role="region"
                  :aria-hidden="!isExpanded(inv.workOrderInvoiceId)"
                >
                  <!-- Overlay inside the panel while charges load -->
                  <LoadingOverlay
                    v-if="
                      chargesState(inv.workOrderInvoiceId).status === 'loading'
                    "
                    message="Loading charges..."
                    class="panel-overlay"
                  />

                  <h6 class="mb-3">Charges</h6>

                  <div
                    v-if="
                      chargesState(inv.workOrderInvoiceId).status === 'idle'
                    "
                  >
                    <button
                      class="btn btn-sm btn-primary"
                      @click="fetchCharges(inv.workOrderInvoiceId)"
                    >
                      Load
                    </button>
                  </div>

                  <div
                    v-else-if="
                      chargesState(inv.workOrderInvoiceId).status === 'error'
                    "
                    class="text-danger"
                  >
                    Failed to load charges.
                    <button
                      class="btn btn-sm btn-link"
                      @click="fetchCharges(inv.workOrderInvoiceId)"
                    >
                      Retry
                    </button>
                  </div>

                  <div
                    v-else-if="
                      chargesState(inv.workOrderInvoiceId).status === 'loaded'
                    "
                  >
                    <table class="table table-sm mb-0 charges-table">
                      <thead class="table-secondary">
                        <tr>
                          <th>Product</th>
                          <th>Product Code</th>
                          <th class="text-end">Amount</th>
                          <th class="text-end">Discount</th>
                          <th class="text-end">Net Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="item in chargesState(inv.workOrderInvoiceId)
                            .data"
                          :key="item.chargeId"
                        >
                          <td>{{ item.productName }}</td>
                          <td>{{ item.productCode }}</td>
                          <td class="text-end">
                            {{ formatCurrency(item.amount) }}
                          </td>
                          <td class="text-end">
                            {{ formatCurrency(item.discount) }}
                          </td>
                          <td class="text-end">
                            {{ formatCurrency(item.balance) }}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="4" class="text-end fw-semibold">
                            Total:
                          </td>
                          <td class="text-end fw-bold">
                            {{
                              formatCurrency(
                                sumCharges(
                                  chargesState(inv.workOrderInvoiceId).data
                                )
                              )
                            }}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </transition>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, reactive, shallowRef, onUnmounted } from "vue";
import ProductsService from "@/modules/shared/services/Products.js";
import LoadingOverlay from "@/modules/shared/components/LoadingOverlay.vue";
import { useRoute } from "vue-router";

const invoices = shallowRef([]);
const loadingInvoices = ref(false);

// chargesCache: Map invoiceId -> { status, data, error }
const chargesCache = reactive(new Map());
const controllers = new Map();
const route = useRoute();

function chargesState(invoiceId) {
  if (!chargesCache.has(invoiceId)) {
    chargesCache.set(invoiceId, { status: "idle", data: [], error: null });
  }
  return chargesCache.get(invoiceId);
}

// expanded set (multiple allowed)
const expanded = ref(new Set());

// load invoices and clear global overlay when done
async function loadSummaries() {
  const workOrderId = Number(
    Number(route.params?.workOrderId || route.query?.workOrderId || 0)
  );
  loadingInvoices.value = true;
  try {
    const resp = await ProductsService.getFleetInvoices(workOrderId);
    invoices.value = resp ?? [];
  } catch (err) {
    console.error("Failed to load invoices", err);
    invoices.value = [];
  } finally {
    loadingInvoices.value = false;
  }
}
loadSummaries();

function toggleExpand(invoiceId) {
  if (expanded.value.has(invoiceId)) {
    expanded.value.delete(invoiceId);
  } else {
    expanded.value.add(invoiceId);
    const state = chargesState(invoiceId);
    if (state.status === "idle") fetchCharges(invoiceId);
  }
}
function isExpanded(id) {
  return expanded.value.has(id);
}

function openNote(id) {
  alert("Open note UI for invoice " + id);
}

async function fetchCharges(invoiceId) {
  const state = chargesState(invoiceId);
  if (state.status === "loading") return;
  state.status = "loading";
  state.error = null;

  if (controllers.has(invoiceId)) {
    controllers.get(invoiceId).abort();
    controllers.delete(invoiceId);
  }
  const controller = new AbortController();
  controllers.set(invoiceId, controller);
  console.log(controllers);
  try {
    const charges = await ProductsService.getInvoiceCharges(invoiceId);
    state.data = charges ?? [];
    state.status = "loaded";
  } catch (err) {
    if (err.name === "AbortError") {
      state.status = "idle";
    } else {
      console.error("fetchCharges error", err);
      state.status = "error";
      state.error = err;
    }
  } finally {
    controllers.delete(invoiceId);
  }
}

// cleanup
onUnmounted(() => {
  for (const [, ctrl] of controllers) ctrl.abort();
});

// helpers
function formatCurrency(x) {
  if (x == null) return "-";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(x);
}
function sumCharges(items = []) {
  return items.reduce((s, it) => s + (Number(it.netAmount) || 0), 0);
}
</script>

<style scoped>
.invoices-container {
  padding: 12px;
  position: relative; /* for global overlay positioning */
}

/* Make summary row borders normal */
.summary-row td {
  border-top: 1px solid #e0e6ea;
}

/* details row: remove top border so the details look attached */
.details-row td {
  border-top: 0 !important;
  background: transparent;
}

/* The details panel visually connects to the row above (no gap) */
.details-panel {
  background: #fbfdff;
  border-left: 1px solid #e0e6ea;
  border-right: 1px solid #e0e6ea;
  border-bottom: 1px solid #e0e6ea;
  margin: 0;
}

/* charges table inside the details panel */
.charges-table thead th {
  border-top: 0;
}

/* Animation: slide down/up using max-height */
.slide-vert-enter-active,
.slide-vert-leave-active {
  transition: max-height 240ms ease, opacity 200ms ease, padding 200ms ease;
}
.slide-vert-enter-from,
.slide-vert-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
}
.slide-vert-enter-to,
.slide-vert-leave-from {
  max-height: 900px;
  opacity: 1;
  overflow: hidden;
}

/* tighten arrow column */
td.text-center {
  width: 40px;
  vertical-align: middle;
}
.btn-link {
  color: inherit;
  text-decoration: none;
}

/* Position the overlay inside the details panel so it covers only that panel */
.details-panel .panel-overlay {
  position: absolute;
  inset: 0; /* top/right/bottom/left = 0 */
  z-index: 30;
}

/* Ensure global overlay covers the whole invoices-container */
.invoices-container > .loading-overlay,
.invoices-container > LoadingOverlay {
  position: absolute;
  inset: 0;
  z-index: 40;
}
</style>
