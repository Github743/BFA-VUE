<template>
  <div class="card p-3 shadow-sm mb-4">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="mb-0">{{ localTitle }}</h6>

      <div>
        <div class="d-flex gap-2">
          <!-- Bulk delete button shown only when 2+ selected -->
          <button
            v-if="selectedCount >= 2"
            class="btn btn-danger"
            @click="deleteSelected"
            :disabled="deleting"
            title="Delete selected discount schedules"
          >
            <span
              v-if="deleting"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            Delete ({{ selectedCount }})
          </button>
        </div>
        <button
          v-if="!readOnly"
          class="btn btn-sm btn-primary"
          @click="openDiscountModal"
        >
          Add Discount Schedule
        </button>
        <button
          v-else
          class="btn btn-sm btn-outline-secondary"
          disabled
          title="Work order is read-only"
        >
          Add Discount Schedule
        </button>
      </div>
    </div>

    <BaseTable
      :columns="columns"
      :rows="clientAgreementEntityProducts"
      :readonly="readOnly"
      :show-actions="true"
      :actions-width="'120px'"
      @edit="onEdit"
      @delete="onDelete"
      :enableBulkDelete="true"
      :idAccessor="(row) => row.workOrderClientAgreementEntityProductId"
      @selection-change="onSelectionChange"
      @bulk-delete="deleteSchedules"
    >
      <template #amount="{ row }">{{ formatMoney(row.amount) }}</template>
    </BaseTable>

    <div class="mt-2 text-muted small text-end">
      Total Products : {{ total }}
    </div>

    <AddDiscountModal
      ref="addDiscountModal"
      :read-only="readOnly"
      @saved="onModalSaved"
      @apply-discount-schedule="onApplyDiscountSchedule"
    />
    <LoadingOverlay :visible="loadProducts" />

    <EditProductModal
      ref="editProductModal"
      :discount-types="discountTypes"
      :read-only="readOnly"
      @saved="onEditSaved"
    />
  </div>
</template>

<script>
import BaseTable from "@/modules/shared/components/BaseTable.vue";
import AddDiscountModal from "@/modules/shared/components/ClientAgreement/AddDiscountModal.vue";
import LoadingOverlay from "@/modules/shared/components/LoadingOverlay.vue";
import EditProductModal from "@/modules/shared/components/ClientAgreement/EditProductModal.vue";
import ProductsService from "@/modules/shared/services/Products.js";
import confirmDialog from "@/modules/shared/utils/confirm.js";
import { showToast } from "@/modules/shared/utils/toast.js";
import { get } from "@/modules/shared/api/http";

export default {
  name: "BfaProductGrid",
  components: { BaseTable, AddDiscountModal, LoadingOverlay, EditProductModal },
  props: {
    readOnly: { type: Boolean, default: false },
    saveOption: { type: Boolean, default: false },
    title: { type: String, default: "" },
  },
  data() {
    return {
      clientAgreementEntityProducts: [],
      loadProducts: false,
      discountTypes: [],
      localTitle: this.title || "",

      selectedCount: 0,
      lastSelectedIds: [],
      deleting: false,
      total: 0,

      columns: [
        {
          label: "WorkOrderClientAgreementEntityProductId",
          field: "workOrderClientAgreementEntityProductId",
          hidden: true,
        },
        { label: "Name", field: "systemProductName" },
        { label: "Discount Type", field: "discountTypeName" },
        { label: "Amount", field: "amount", width: "15%" },
      ],
    };
  },
  async mounted() {
    const workOrderId = Number(
      this.$route?.params?.workOrderId || this.$route?.query?.workOrderId || 0
    );

    try {
      if (workOrderId) {
        const clientAgreement = await get(`ClientAgreement/${workOrderId}`);
        // guard and fallback
        this.localTitle =
          clientAgreement?.systemDiscountScheduleName || this.title;
      } else {
        // no workOrderId -> use prop title
        this.localTitle = this.title;
      }
    } catch (err) {
      console.error("Failed to load client agreement title:", err);
      this.localTitle = this.title;
    }

    if (workOrderId) await this.fetchEntityProducts(workOrderId);
    await this.loadDiscountTypes();
  },
  methods: {
    /**
     * Called by BaseTable when selection changes.
     * selectedIds is expected to be an array of ids (strings) from BaseTable.
     */
    onSelectionChange(selectedIds) {
      this.lastSelectedIds = Array.isArray(selectedIds) ? [...selectedIds] : [];
      this.selectedCount = this.lastSelectedIds.length;
    },

    openDiscountModal() {
      if (this.readOnly) return;
      const modalEl =
        this.$refs.addDiscountModal?.$el ||
        document.getElementById("addDiscountModal");
      if (!modalEl) return console.error("Modal element not found");
      const ModalCtor =
        (window.bootstrap && window.bootstrap.Modal) ||
        require("bootstrap").Modal;
      const modal = ModalCtor.getInstance
        ? ModalCtor.getInstance(modalEl) ?? new ModalCtor(modalEl)
        : new ModalCtor(modalEl);
      modal.show();
    },

    async loadDiscountTypes() {
      try {
        const res = await ProductsService.getDiscountTypes();
        this.discountTypes = (Array.isArray(res) ? res : []).map((d) => ({
          code: d.lookupId,
          name: d.displayName,
        }));
      } catch (err) {
        console.error("Failed to load discount types:", err);
        this.discountTypes = [];
      }
    },

    async fetchEntityProducts(workOrderId) {
      if (!workOrderId) return;
      this.loadProducts = true;
      try {
        const entities = await ProductsService.getEntityProducts(
          Number(workOrderId)
        );
        const list = Array.isArray(entities)
          ? entities
          : entities?.items ?? entities?.data ?? [];
        this.clientAgreementEntityProducts = (list || []).map((e) => ({
          ...e,
          systemProductName: e.systemProductName,
          discountType: e.discountType,
          discountTypeName: e.discountTypeName,
          amount: e.amount,
          systemProductId: e.systemProductId,
          defaultOrder: e.defaultOrder,
        }));
        this.total = this.clientAgreementEntityProducts.length;
        this.$emit("update:products", [...this.clientAgreementEntityProducts]);
      } catch (err) {
        console.error("Failed to load entity products:", err);
      } finally {
        this.loadProducts = false;
      }
    },

    formatMoney(n) {
      const num = parseFloat(n || 0);
      return num.toFixed(2);
    },

    onEdit({ row, rowIndex } = {}) {
      const idx = Number.isFinite(rowIndex)
        ? rowIndex
        : this.clientAgreementEntityProducts.findIndex(
            (r) => r === row || r.id === (row && row.id)
          );
      if (idx === -1) {
        console.warn("Edit: row index not found", { row, rowIndex });
        return;
      }

      Promise.resolve(this.loadDiscountTypes()).then(() => {
        this.$refs.editProductModal?.show(
          this.clientAgreementEntityProducts[idx],
          idx
        );
      });
    },

    async onEditSaved({ row, index }) {
      if (index == null || index < 0) return;
      const existing = this.clientAgreementEntityProducts[index] || {};
      const updated = { ...existing, ...row };

      // update UI fields (discount type label)
      const dtMatch = this.discountTypes.find(
        (dt) => dt.code === updated.discountType
      );
      if (dtMatch) updated.discountTypeName = dtMatch.name;

      // Optimistically update UI so user sees it immediately
      this.$set
        ? this.$set(this.clientAgreementEntityProducts, index, updated)
        : this.clientAgreementEntityProducts.splice(index, 1, updated);

      this.$emit("update:products", [...this.clientAgreementEntityProducts]);

      try {
        this.loadProducts = true;
        await ProductsService.updateEntityProduct(updated);

        this.fetchEntityProducts(Number(this.$route?.params?.workOrderId));
      } catch (err) {
        this.fetchEntityProducts(Number(this.$route?.params?.workOrderId));
        // optionally show error toast
      } finally {
        this.loadProducts = false;
      }
    },

    async onDelete({ row } = {}) {
      const confirmed = await confirmDialog({
        title: "Delete product discount",
        message: `Are you sure you want to delete the discount for <strong>${row.systemProductName}</strong>? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        confirmClass: "btn-danger",
      });

      if (!confirmed) return;

      try {
        this.loadProducts = true;
        const id = row.workOrderClientAgreementEntityProductId;
        if (await ProductsService.deleteEntityProduct(Number(id))) {
          showToast(
            "Deleted the selected product " + row.systemProductName,
            "success"
          );
        } else {
          showToast("Failed to delete product. Please try again.", "danger");
        }
      } catch (err) {
        showToast("Failed to delete product. Please try again.", "danger");
      } finally {
        this.loadProducts = false;
        this.fetchEntityProducts(Number(this.$route?.params?.workOrderId));
      }
    },

    /**
     * Called when user clicks the top-level "Delete (N)" button.
     * Uses lastSelectedIds stored by onSelectionChange.
     */
    async deleteSelected() {
      if (!this.lastSelectedIds || this.lastSelectedIds.length === 0) return;
      const csv = this.lastSelectedIds.join(",");
      await this.deleteSchedules(csv);
    },

    /**
     * deleteSchedules accepts either:
     *  - a CSV string of ids, or
     *  - an array of ids (from BaseTable's bulk-delete)
     *
     * It will normalize and call ProductsService.deleteAll(...)
     */
    async deleteSchedules(ids) {
      // normalize incoming ids into an array
      let idArray = [];

      if (Array.isArray(ids)) {
        idArray = [...ids];
      } else if (typeof ids === "string" && ids.trim() !== "") {
        // CSV string fallback
        idArray = ids.split(",").map((s) => s.trim());
      } else {
        // nothing to delete
        return;
      }

      // convert to numbers, filter out invalids
      const numericIds = idArray
        .map((v) => {
          // accept either "123" or number 123
          const n = Number(v);
          return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
        })
        .filter((n) => n !== null);

      if (!numericIds.length) return;

      try {
        this.loadProducts = true;
        this.deleting = true;

        // IMPORTANT: call API with an array of integers (JSON array)
        // Make sure ProductsService.deleteAll sends the array as JSON body or the way your backend expects it.
        const res = await ProductsService.deleteAll(numericIds);

        if (res) {
          showToast("Deleted selected products.", "success");
        } else {
          showToast("Failed to delete selected products.", "danger");
        }
      } catch (err) {
        console.error("deleteSchedules error:", err);
        showToast("Failed to delete selected products.", "danger");
      } finally {
        this.deleting = false;
        this.loadProducts = false;

        // reset local selection state
        this.lastSelectedIds = [];
        this.selectedCount = 0;

        // refresh list
        this.fetchEntityProducts(Number(this.$route?.params?.workOrderId));
      }
    },

    async onModalSaved() {
      const workOrderId = Number(
        this.$route?.params?.workOrderId || this.$route?.query?.workOrderId || 0
      );
      if (!workOrderId) return;
      await this.fetchEntityProducts(workOrderId);
      // if you want to always refresh title from server, call refreshTitle()
      // await this.refreshTitle();
    },

    async onApplyDiscountSchedule(payload) {
      try {
        if (payload && payload.schedule) {
          const schedule = payload.schedule;
          const name =
            schedule.systemDiscountScheduleName || schedule.name || null;
          if (name) {
            this.localTitle = name;
            const workOrderId = Number(
              this.$route?.params?.workOrderId ||
                this.$route?.query?.workOrderId ||
                0
            );
            if (workOrderId) await this.fetchEntityProducts(workOrderId);
            return;
          }
        }
        await this.refreshTitle();
      } catch (err) {
        console.error("onApplyDiscountSchedule error:", err);
      }
    },

    async refreshTitle() {
      try {
        const workOrderId = Number(
          this.$route?.params?.workOrderId ||
            this.$route?.query?.workOrderId ||
            0
        );
        if (!workOrderId) return;
        const clientAgreement = await get(`ClientAgreement/${workOrderId}`);
        this.localTitle =
          clientAgreement?.systemDiscountScheduleName || this.title;
      } catch (err) {
        console.error("Failed to refresh title:", err);
      }
    },
  },
};
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}
</style>
