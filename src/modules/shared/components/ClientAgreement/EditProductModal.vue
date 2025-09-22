<template>
  <div class="modal fade" ref="el" tabindex="-1" aria-hidden="true" :id="id">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Product</h5>
          <button
            type="button"
            class="btn-close"
            @click="hide"
            aria-label="Close"
          />
        </div>
        <div class="modal-body">
          <div v-if="!editingRow">Loading...</div>

          <div v-else>
            <div class="mb-2">
              <label class="form-label">Product</label>
              <input
                type="text"
                class="form-control"
                :value="editingRow.systemProductName"
                :disabled="true"
              />
            </div>

            <div class="mb-2">
              <label class="form-label">Discount Type</label>
              <select
                v-model="editingRow.discountType"
                class="form-select"
                :disabled="readOnly"
              >
                <option disabled value="">-- Select --</option>
                <option
                  v-for="dt in discountTypes"
                  :key="dt.code"
                  :value="dt.code"
                >
                  {{ dt.name }}
                </option>
              </select>
            </div>

            <div class="mb-2">
              <label class="form-label">Amount</label>
              <input
                type="number"
                step="0.01"
                v-model.number="editingRow.amount"
                class="form-control"
                :readonly="readOnly"
              />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="hide">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="onSave"
            :disabled="saving || readOnly"
          >
            <span
              v-if="saving"
              class="spinner-border spinner-border-sm me-2"
            ></span>
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
  name: "EditProductModal",
  props: {
    id: { type: String, default: "editProductModal" },
    readOnly: { type: Boolean, default: false },
    discountTypes: { type: Array, default: () => [] },
  },
  emits: ["saved"],
  data() {
    return {
      editingRow: null,
      editingIndex: -1,
      saving: false,
      bsModal: null,
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
    show(row = null, index = -1) {
      if (!row) {
        this.editingRow = null;
        this.editingIndex = -1;
      } else {
        this.editingRow = JSON.parse(JSON.stringify(row));
        this.editingIndex = index;
        if (this.editingRow.discountType == null)
          this.editingRow.discountType = "";
      }
      this.bsModal?.show();
    },
    hide() {
      this.bsModal?.hide();
      this.editingRow = null;
      this.editingIndex = -1;
    },
    async onSave() {
      if (this.saving) return;
      this.saving = true;
      try {
        if (this.editingRow.amount == null) this.editingRow.amount = 0;
        this.$emit("saved", { row: this.editingRow, index: this.editingIndex });
        this.hide();
      } catch (err) {
        console.error("EditProductModal save error:", err);
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