<template>
  <div class="modal fade" ref="el" tabindex="-1" aria-hidden="true" :id="id">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Additional Discount</h5>
          <button
            type="button"
            class="btn-close"
            @click="hide"
            aria-label="Close"
          ></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="onSubmit" novalidate>
            <div v-if="loadingRow" class="text-center py-3">Loading...</div>

            <div v-else>
              <div class="mb-3">
                <label class="form-label">Discount Type*</label>
                <select
                  class="form-select"
                  v-model="form.discountType"
                  :disabled="readOnly || loading"
                  :class="{ 'is-invalid': errors.discountType }"
                >
                  <option value="">Please select Discount Type</option>
                  <option
                    v-for="dt in discountTypes"
                    :key="dt.code"
                    :value="dt.code"
                  >
                    {{ dt.name }}
                  </option>
                </select>
                <div v-if="errors.discountType" class="invalid-feedback">
                  {{ errors.discountType }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Amount*</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  v-model.number="form.amount"
                  class="form-control"
                  :class="{ 'is-invalid': errors.amount }"
                  :disabled="readOnly"
                  placeholder="Enter amount"
                />
                <div v-if="errors.amount" class="invalid-feedback">
                  {{ errors.amount }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Expiry Date</label>
                <input
                  type="date"
                  v-model="form.expiryDate"
                  class="form-control"
                  :disabled="readOnly"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Limit Per Year</label>
                <input
                  type="number"
                  v-model.number="form.limitPerYear"
                  min="0"
                  class="form-control"
                  :disabled="readOnly"
                  placeholder="Optional"
                />
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="hide">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="onSubmit"
            :disabled="readOnly || saving"
          >
            <span
              v-if="saving"
              class="spinner-border spinner-border-sm me-2"
              role="status"
            />
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from "bootstrap";

export default {
  name: "EditAdditionalDiscountModal",
  props: {
    id: { type: String, default: "editAdditionalDiscountModal" },
    readOnly: { type: Boolean, default: false },
    // you can pass discount types from parent, or let modal load them if empty
    discountTypes: { type: Array, default: () => [] },
  },
  emits: ["saved"],
  data() {
    return {
      bsModal: null,
      loading: false, // for discount types load
      saving: false,
      loadingRow: true, // shows "Loading..." until show() sets form
      form: {
        // shape: systemProductName, discountType, amount, expiryDate, limitPerYear, id (if any)
        systemProductName: "",
        discountType: "",
        amount: null,
        expiryDate: null,
        limitPerYear: null,
        id: null,
      },
      errors: { discountType: null, amount: null },
      currentIndex: -1,
    };
  },
  mounted() {
    const el = this.$refs.el;
    if (el)
      this.bsModal = new Modal(el, { backdrop: "static", keyboard: false });
  },
  beforeUnmount() {
    if (this.bsModal) {
      this.bsModal.dispose();
      this.bsModal = null;
    }
  },
  methods: {
    // show(row, index) - row may be passed to edit; if null -> new / reset
    show(row = null, index = -1) {
      this.resetErrors();
      this.currentIndex = Number.isFinite(index) ? index : -1;
      if (!row) {
        // blank form for add
        this.form = {
          systemProductName: "",
          discountType: "",
          amount: null,
          expiryDate: null,
          limitPerYear: null,
          id: null,
        };
        this.loadingRow = false;
      } else {
        // deep copy row into form so we don't mutate original until saved
        this.form = {
          systemProductName: row.systemProductName ?? "",
          discountType: row.discountType ?? row.discountTypeCode ?? "" ?? "",
          amount: row.amount ?? null,
          expiryDate: row.expiryDate
            ? this._normalizeDate(row.expiryDate)
            : null,
          limitPerYear: row.limitPerYear ?? null,
          id: row.id ?? row.workOrderClientAgreementEntityProductId ?? null,
        };
        this.loadingRow = false;
      }

      // ensure discountTypes loaded if not provided
      if (!this.discountTypes || !this.discountTypes.length) {
        this.loadDiscountTypes().catch(() => {});
      }

      // show modal
      this.bsModal?.show();
    },

    hide() {
      this.bsModal?.hide();
      this.resetForm();
    },

    resetErrors() {
      this.errors = { discountType: null, amount: null };
    },

    resetForm() {
      this.form = {
        systemProductName: "",
        discountType: "",
        amount: null,
        expiryDate: null,
        limitPerYear: null,
        id: null,
      };
      this.currentIndex = -1;
      this.loadingRow = true;
      this.resetErrors();
    },

    _normalizeDate(val) {
      // if val is ISO string or contains date, ensure YYYY-MM-DD for input[type=date]
      if (!val) return null;
      const d = new Date(val);
      if (isNaN(d.getTime())) return null;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    },

    async loadDiscountTypes() {
      // If parent provided discountTypes, don't re-load here.
      // If you want modal to load itself, implement service call here.
      // For now we'll skip loading from service when discountTypes prop is provided.
      return Promise.resolve();
    },

    validate() {
      this.resetErrors();
      let ok = true;
      alert(this.form.discountType);
      if (!this.form.discountType) {
        this.errors.discountType = "Discount type is required.";
        ok = false;
      }
      const amt = parseFloat(this.form.amount);
      if (isNaN(amt) || amt <= 0) {
        this.errors.amount = "Amount is required and must be greater than 0.";
        ok = false;
      }
      return ok;
    },

    async onSubmit() {
      if (this.readOnly) return;
      if (this.saving) return;
      if (!this.validate()) {
        // focus first invalid input (optional)
        return;
      }

      this.saving = true;
      try {
        // build payload to emit; include id if editing
        const payload = {
          id: this.form.id,
          systemProductName: this.form.systemProductName,
          discountType: this.form.discountType,
          amount: Number(this.form.amount),
          expiryDate: this.form.expiryDate || null,
          limitPerYear:
            this.form.limitPerYear !== null && this.form.limitPerYear !== ""
              ? Number(this.form.limitPerYear)
              : null,
        };

        // emit the saved payload and index so parent refreshes/updates
        this.$emit("saved", { row: payload, index: this.currentIndex });
        this.hide();
      } catch (err) {
        console.error("EditAdditionalDiscountModal submit error:", err);
        // optionally set a form-level error
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.modal .form-control {
  font-size: 0.95rem;
}
</style>
