<template>
  <div
    class="modal fade"
    id="addDiscountModal"
    tabindex="-1"
    aria-labelledby="addDiscountModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title" id="addDiscountModalLabel">Add Discount</h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            data-bs-dismiss="modal"
            aria-label="Close"
            :disabled="saving || readOnly"
          ></button>
        </div>

        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label fw-bold">Pick Discount Schedule</label>
            <select
              v-model="selectedScheduleId"
              class="form-select"
              @change="loadScheduleProducts"
              :disabled="loadingProducts || saving || readOnly"
            >
              <option disabled value="">-- Select a schedule --</option>
              <option
                v-for="s in schedules"
                :key="s.systemDiscountScheduleId"
                :value="s.systemDiscountScheduleId"
              >
                {{ s.name }}
              </option>
            </select>
          </div>

          <div v-if="loadingProducts" class="text-center my-3">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading products...</p>
          </div>

          <div v-else-if="scheduleProducts.length">
            <div class="table-wrapper">
              <table class="table table-sm table-bordered align-middle">
                <thead class="table-light sticky-header">
                  <tr>
                    <th>Product</th>
                    <th style="width: 150px">Discount Type</th>
                    <th style="width: 100px">Amount</th>
                    <th class="d-none">Default Order</th>
                    <th class="d-none">System Product Id</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, idx) in scheduleProducts" :key="idx">
                    <td>{{ p.systemProductName }}</td>
                    <select
                      v-model="p.discountType"
                      class="form-select form-select-sm"
                      :disabled="saving || readOnly || !discountTypes.length"
                    >
                      <option disabled value="">-- Select --</option>
                      <option
                        v-for="dt in discountTypes"
                        :key="dt.code ?? dt.id ?? dt.value"
                        :value="dt.code ?? dt.id ?? dt.value"
                      >
                        {{ dt.name ?? dt.label ?? dt.text }}
                      </option>
                    </select>
                    <td>
                      <input
                        type="number"
                        v-model.number="p.amount"
                        class="form-control form-control-sm"
                        step="0.01"
                        :disabled="saving || readOnly"
                      />
                    </td>
                    <td class="d-none">{{ p.defaultOrder }}</td>
                    <td class="d-none">{{ p.systemProductId }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="error" class="text-danger mt-2">{{ error }}</div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-secondary"
            data-bs-dismiss="modal"
            :disabled="saving"
          >
            Close
          </button>

          <!-- hide Save when readOnly -->
          <button
            v-if="!readOnly"
            type="button"
            class="btn btn-primary"
            @click="saveProducts"
            :disabled="!selectedScheduleId || saving || loadingProducts"
          >
            <span
              v-if="saving"
              class="spinner-border spinner-border-sm me-2"
              role="status"
            ></span>
            {{ saving ? "Saving..." : "Save" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from "bootstrap";
import ProductsService from "@/modules/shared/services/Products.js";

export default {
  name: "AddDiscountModal",
  props: {
    readOnly: { type: Boolean, default: false }, // <- important
  },
  data() {
    return {
      schedules: [],
      selectedScheduleId: "",
      scheduleProducts: [],
      discountTypes: [],
      error: null,
      loadingSchedules: false,
      loadingProducts: false,
      saving: false,
      modalHiddenHandler: null,
    };
  },
  async mounted() {
    await this.loadSchedules();

    const modalEl = document.getElementById("addDiscountModal");
    if (modalEl) {
      this.modalHiddenHandler = () => {
        this.reset();
      };
      modalEl.addEventListener("hidden.bs.modal", this.modalHiddenHandler);
    }
  },
  beforeUnmount() {
    const modalEl = document.getElementById("addDiscountModal");
    if (modalEl && this.modalHiddenHandler) {
      modalEl.removeEventListener("hidden.bs.modal", this.modalHiddenHandler);
      this.modalHiddenHandler = null;
    }
  },
  methods: {
    reset() {
      this.selectedScheduleId = "";
      this.scheduleProducts = [];
      this.error = null;
      this.loadingProducts = false;
      this.saving = false;
    },

    async loadSchedules() {
      try {
        this.loadingSchedules = true;
        const workOrderId = this.$route?.params?.workOrderId;
        this.schedules = await ProductsService.getSchedules(workOrderId);
        const dt = await ProductsService.getDiscountTypes();
        this.discountTypes = (dt || []).map((d) => ({
          code: d.lookupId,
          name: d.displayName,
        }));
      } catch (err) {
        console.error("Error fetching schedules:", err);
        this.error = "Failed to load discount schedules.";
      } finally {
        this.loadingSchedules = false;
      }
    },

    async loadScheduleProducts() {
      if (!this.selectedScheduleId) return;
      try {
        this.loadingProducts = true;
        this.scheduleProducts = [];
        const products = await ProductsService.getScheduleProducts(
          this.selectedScheduleId
        );

        let list = Array.isArray(products)
          ? products
          : products?.items ?? products?.data ?? [];

        this.scheduleProducts = list.map((e) => {
          return {
            ...e,
          };
        });
      } catch (err) {
        console.error("Error fetching schedule products:", err);
        this.error = "Failed to load schedule products.";
      } finally {
        this.loadingProducts = false;
      }
    },

    mapDiscountType(name) {
      const map = {
        "Fixed amount": 1,
        Discount: 2,
        Other: 99,
      };
      return map[name] ?? null;
    },

    async saveProducts() {
      if (!this.selectedScheduleId) return;
      this.error = null;
      this.saving = true;

      try {
        const payload = this.scheduleProducts.map((p) => ({
          DefaultOrder: p.defaultOrder,
          DiscountType: p.discountType,
          SystemProductId: p.systemProductId,
          DiscountTypeName: p.discountTypeName,
          Amount:
            p.amount === "" || p.amount === null || p.amount === undefined
              ? null
              : Number(p.amount),
          IsCustomized: p.isCustomized ?? false,
          IsAdditionalDiscount: p.isAdditionalDiscount ?? false,
          LimitPerYear: p.limitPerYear ?? null,
          ExpiryDate: p.expiryDate ?? null,
          StartDate: p.startDate ?? null,
          TonnageBilling: p.tonnageBilling ?? null,
          IsOngoingDiscount: p.isOngoingDiscount ?? false,
        }));

        const workOrderId = Number(this.$route?.params?.workOrderId || 0);

        const result = await ProductsService.saveEntityProducts(
          payload,
          workOrderId
        );
        if (result === true) {
          // emit for parent(s)
          this.$emit("apply-discount-schedule", {
            schedule: this.schedules.find(
              (s) =>
                String(s.systemDiscountScheduleId) ===
                String(this.selectedScheduleId)
            ),
            products: payload,
          });

          // also emit simple saved event so grids/listeners refresh
          this.$emit("saved");

          // close modal
          const modalEl = document.getElementById("addDiscountModal");
          const modal = Modal.getInstance(modalEl) ?? new Modal(modalEl);
          if (modal) modal.hide();
        } else {
          this.error = "Server failed to save discount products.";
        }
      } catch (err) {
        console.error("Save error:", err);
        if (err?.response && err.response.data) {
          this.error =
            err.response.data?.message ?? JSON.stringify(err.response.data);
        } else {
          this.error = err.message ?? "Unexpected error while saving.";
        }
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.table-wrapper {
  max-height: 250px; /* fixed height */
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
}
.sticky-header th {
  position: sticky;
  top: 0;
  background: #f8f9fa; /* Bootstrap table-light color */
  z-index: 2;
}
.table td,
.table th {
  vertical-align: middle;
  font-size: 0.875rem;
  white-space: nowrap;
}
</style>
