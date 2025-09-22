<template>
  <div class="workorder-page container-fluid py-3">
    <div class="row">
      <!-- LEFT: filter panel -->
      <aside class="col-md-3">
        <div class="card p-3">
          <button class="btn btn-sm btn-primary mb-3" @click="toggleFilters">
            {{ showFilters ? "Hide Filter" : "Show Filter" }}
          </button>

          <div v-show="showFilters">
            <div class="mb-3">
              <label class="form-label small">Work Order Number</label>
              <input v-model="form.workOrderId" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label small">Work Order Name</label>
              <select v-model="form.workOrderName" class="form-select">
                <option value="">Select Work Order</option>
                <option v-for="w in workOrders" :key="w.value" :value="w.value">
                  {{ w.label }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label small">Vessel Name</label>
              <input v-model="form.vesselName" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label small">Client Name</label>
              <input v-model="form.clientName" class="form-control" />
            </div>

            <div class="d-flex gap-2 mt-2">
              <button class="btn btn-primary" :disabled="isSearching" @click="onSearch">
                <i v-if="isSearching" class="spinner-border spinner-border-sm me-1"></i>
                Search
              </button>
              <button class="btn btn-outline-secondary" @click="clearForm" :disabled="isSearching">
                Clear
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main class="col-md-9">

        <div class="card">
          <div v-if="isSearching" class="loading-panel p-5 d-flex flex-column align-items-center justify-content-center">
            <div class="mb-3 text-center">
              <div class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></div>
            </div>

            <div class="mb-2 text-center">
              <strong>Searching work orders…</strong>
            </div>

            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-primary" disabled>
                <i class="spinner-border spinner-border-sm me-1"></i>
                Searching
              </button>
              <button class="btn btn-outline-secondary" @click="cancelSearch">Cancel</button>
            </div>
          </div>

          <div v-else class="table-responsive" style="overflow-x:auto">
            <table class="table mb-0">
              <thead class="table-light">
                <tr>
                  <th>Work Order</th>
                  <th>Work Order Name</th>
                  <th>Detail</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="results.length === 0">
                  <td colspan="4" class="text-muted text-center">No items to display</td>
                </tr>

                <tr v-for="(r, idx) in results" :key="r.workOrderId ?? r.id ?? idx">
                  <td>
      <RouterLink
  :to="{
    name: 'BfaStepper',
    params: { step: 'options', workOrderId: String(r.workOrderId) }
  }"
  class="text-decoration-none"
>
  {{ r.workOrderId }}
</RouterLink>

    </td>
                  <td>{{ r.workOrderName }}</td>
                  <td>{{ r.detail }}</td>
                  <td>{{ r.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination block -->
        <div v-if="results.length>0" class="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
          <!-- left: pager buttons -->
          <nav aria-label="Work orders navigation">
            <ul class="pagination mb-0">
              <li :class="['page-item', { disabled: page === 1 || isSearching }]">
                <button class="page-link" @click="goFirst" :disabled="page === 1 || isSearching">«</button>
              </li>

              <li :class="['page-item', { disabled: page === 1 || isSearching }]">
                <button class="page-link" @click="prevPage" :disabled="page === 1 || isSearching">‹</button>
              </li>

              <template v-for="p in pageList" :key="p.key">
                <li v-if="p.type === 'page'" :class="['page-item', { active: p.value === page, disabled: isSearching }]">
                  <button class="page-link" @click="changePage(p.value)" :disabled="isSearching">{{ p.value }}</button>
                </li>
                <li v-else class="page-item disabled"><span class="page-link">…</span></li>
              </template>

              <li :class="['page-item', { disabled: page >= totalPages || isSearching }]">
                <button class="page-link" @click="nextPage" :disabled="page >= totalPages || isSearching">›</button>
              </li>

              <li :class="['page-item', { disabled: page >= totalPages || isSearching }]">
                <button class="page-link" @click="goLast" :disabled="page >= totalPages || isSearching">»</button>
              </li>
            </ul>
          </nav>

          <!-- center: page size -->
          <div class="d-flex align-items-center gap-2">
            <select class="form-select form-select-sm" style="width:96px" v-model.number="pageSize" @change="changePageSize">
              <option v-for="s in pageSizes" :key="s" :value="s">{{ s }}</option>
            </select>
            <span class="text-muted small">items per page</span>
          </div>

          <!-- right: summary -->
          <div class="text-muted small ms-auto"> {{ pageStart }} - {{ pageEnd }} of {{ totalItems }} items </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { searchWorkOrders } from "@/modules/workorder/workorderApi";

const workOrders = ref([
  { value: "Issue Block Fee Agreement", label: "Issue Block Fee Agreement" },
  { value: "Amend Block Fee Agreement", label: "Amend Block Fee Agreement" },
  { value: "Terminate Block Fee Agreement", label: "Terminate Block Fee Agreement" },
]);

const showFilters = ref(true);
const isSearching = ref(false);

const page = ref(1);
const pageSize = ref(50);
const pageSizes = [10, 25, 50, 100];

const results = ref([]);
const totalItems = ref(0);

// form model
const form = reactive({
  workOrderId: "",
  workOrderName: "",
  vesselName: "",
  on: "",
  imo: "",
  clientNumber: "",
  clientName: "",
  billToClientName: "",
  invoiceNumber: "",
  status: "",
  fromDate: "",
  toDate: "",
});

let currentController = null;

const totalPages = computed(() => {
  const ps = Math.max(1, pageSize.value);
  return Math.max(1, Math.ceil((totalItems.value || 0) / ps));
});

// 1-based index of first and last item on current page
const pageStart = computed(() => {
  if (!totalItems.value) return 0;
  return (page.value - 1) * pageSize.value + 1;
});
const pageEnd = computed(() => {
  if (!totalItems.value) return 0;
  return Math.min(totalItems.value, page.value * pageSize.value);
});


const pageList = computed(() => {
  const total = totalPages.value;
  const current = page.value;
  const maxButtons = 7; 
  if (total <= maxButtons) {
    return Array.from({ length: total }, (_, i) => ({ type: "page", value: i + 1, key: `p${i + 1}` }));
  }

  const window = 2;
  const pages = new Set();

  pages.add(1);
  pages.add(total);


  for (let i = current - window; i <= current + window; i++) {
    if (i > 1 && i < total) pages.add(i);
  }


  pages.add(2);
  pages.add(total - 1);

  const sorted = Array.from(pages).filter(p => p >= 1 && p <= total).sort((a, b) => a - b);

  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] !== sorted[i - 1] + 1) {
      result.push({ type: "dots", key: `d${i}` });
    }
    result.push({ type: "page", value: sorted[i], key: `p${sorted[i]}` });
  }
  return result;
});

function toggleFilters() {
  showFilters.value = !showFilters.value;
}

function clearForm() {
  Object.keys(form).forEach((k) => (form[k] = ""));
  results.value = [];
  page.value = 1;
  totalItems.value = 0;
}

function cancelSearch() {
  if (currentController) {
    try { currentController.abort(); } catch {alert()}
    currentController = null;
    isSearching.value = false;
  }
}

function changePage(n) {
  if (isSearching.value) return;
  if (n < 1 || n > totalPages.value || n === page.value) return;
  page.value = n;
  onSearch(false);
}

function goFirst() {
  changePage(1);
}
function goLast() {
  changePage(totalPages.value);
}
function prevPage() {
  changePage(Math.max(1, page.value - 1));
}
function nextPage() {
  changePage(Math.min(totalPages.value, page.value + 1));
}

function changePageSize() {
  page.value = 1;
  onSearch();
}

async function onSearch(resetToPage = true) {
  try {
    if (resetToPage) page.value = 1;

    if (currentController) {
      try { currentController.abort(); } catch {alert()}
      currentController = null;
    }
    currentController = new AbortController();
    const signal = currentController.signal;

    isSearching.value = true;
    results.value = [];

    const payload = {
      WorkOrderName: form.workOrderName || null,
      WorkOrderId: form.workOrderId ? Number(form.workOrderId) : null,
      Status: form.status || null,
      Page: Math.max(1, page.value),
      PageSize: Math.max(1, pageSize.value),
    };

    const data = await searchWorkOrders(payload, signal);
const items = data.items ?? data.Items ?? data.ItemsList ?? [];
    const total = data.totalItems ?? data.TotalItems ?? data.TotalCount ?? 0;


    const validNames = [
      "Issue Block Fee Agreement",
      "Amend Block Fee Agreement",
      "Terminate Block Fee Agreement",
    ];
    
     if (total >0)
     {
      if(total == 1 && items[0] && validNames.includes(items[0].workOrderName)){
      results.value = items;
      totalItems.value = total;
      }
      else{
        results.value = items;
      totalItems.value = total;
      }
    } else {
      results.value = [];
      totalItems.value = 0;
    }

    currentController = null;
  } catch (err) {
    if (err?.name === "CanceledError" || /canc/gi.test(err?.message)) return;
    console.error("searchWorkOrders failed:", err);
  } finally {
    isSearching.value = false;
  }
}
</script>

<style scoped>
.workorder-page { padding: 0.5rem 1rem; }
aside.card { border-radius: 6px; }
.table thead th {
  background: #e9eef4;
  border-top: 1px solid #d3dfe8;
  font-weight: 600;
}
.loading-panel { min-height: 220px; }
.pagination .page-item.disabled .page-link { cursor: not-allowed; }
</style>
