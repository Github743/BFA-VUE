<template>
  <div class="card p-3 shadow-sm mb-4">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="mb-0">{{ title }}</h6>

      <div>
        <button
          v-if="!readOnly"
          class="btn btn-sm btn-primary"
          @click="openDiscountModal"
        >
          Add Additional Discount
        </button>
        <button
          v-else
          class="btn btn-sm btn-outline-secondary"
          disabled
          title="Work order is read-only"
        >
          Add Additional Discount
        </button>
      </div>
    </div>

    <BaseTable
      :columns="columns"
      :rows="additionalDiscountedProducts"
      :readonly="readOnly"
      :show-actions="true"
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
      Total Additional Discounts : {{ total }}
    </div>

    <AdditionalDiscountModal
      ref="additionalDiscountModal"
      :read-only="readOnly"
      @saved="onModalSaved"
    />

    <EditAdditionalDiscountModal
      ref="editAdditionalDiscountModal"
      :discount-types="discountTypes"
      :read-only="readOnly"
      @saved="onEditSaved"
    />

    <LoadingOverlay :visible="loadProducts" />
  </div>
</template>

<script>
import BaseTable from "@/modules/shared/components/BaseTable.vue";
import AdditionalDiscountModal from "@/modules/shared/components/ClientAgreement/AdditionaDiscountModal.vue";
import ProductsService from "@/modules/shared/services/Products.js";
import LoadingOverlay from "@/modules/shared/components/LoadingOverlay.vue";
import EditAdditionalDiscountModal from "@/modules/shared/components/ClientAgreement/EditAdditionalProductModal.vue";
import confirmDialog from "@/modules/shared/utils/confirm.js";
import { showToast } from "@/modules/shared/utils/toast.js";

export default {
  name: "AdditionalDiscount",
  components: {
    BaseTable,
    AdditionalDiscountModal,
    LoadingOverlay,
    EditAdditionalDiscountModal,
  },

  props: {
    readOnly: { type: Boolean, default: false },
    saveOption: { type: Boolean, default: false },
    title: { type: String, default: "" },
  },

  data() {
    return {
      additionalDiscountedProducts: [],
      loadProducts: false,
      discountTypes: [],
      columns: [
        {
          label: "WorkOrderClientAgreementEntityProductId",
          field: "workOrderClientAgreementEntityProductId",
          hidden: true,
        },
        { label: "Product", field: "systemProductName" },
        { label: "Product Code", field: "productCode", width: "100px" },
        { label: "Discount", field: "amount" },
        { label: "Discount Type", field: "discountTypeName" },
        {
          label: "Expiration Date",
          field: "expiryDate",
          type: "date",
          width: "114px",
        },
        { label: "Limit", field: "limitPerYear" },
        { label: "Added By", field: "createdBy" },
        {
          label: "Date",
          field: "creationDate",
          type: "date",
          width: "114px",
        },
      ],
      selectedCount: 0,
      lastSelectedIds: [],
      deleting: false,
      total: 0,
    };
  },

  async mounted() {
    const workOrderId = Number(
      this.$route?.params?.workOrderId || this.$route?.query?.workOrderId || 0
    );
    if (workOrderId) await this.fetchAdditionalDiscountedProducts(workOrderId);
    await this.loadDiscountTypes();
  },

  methods: {
    openDiscountModal() {
      if (this.readOnly) return;
      // show the add modal (you already had this)
      if (this.readOnly) return;
      const modalEl =
        this.$refs.additionalDiscountModal?.$el ||
        document.getElementById("additionalDiscountModal");
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
        this.fetchAdditionalDiscountedProducts(
          Number(this.$route?.params?.workOrderId)
        );
      }
    },

    /**
     * Called by BaseTable when selection changes.
     * selectedIds is expected to be an array of ids (strings) from BaseTable.
     */
    onSelectionChange(selectedIds) {
      this.lastSelectedIds = Array.isArray(selectedIds) ? [...selectedIds] : [];
      this.selectedCount = this.lastSelectedIds.length;
      alert(this.selectedIds);
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
        this.fetchAdditionalDiscountedProducts(
          Number(this.$route?.params?.workOrderId)
        );
      }
    },

    async onEditSaved({ row, index }) {
      if (index == null || index < 0) return;
      const existing = this.additionalDiscountedProducts[index] || {};
      const updated = { ...existing, ...row };

      // update UI fields (discount type label)
      const dtMatch = this.discountTypes.find(
        (dt) => dt.code === updated.discountType
      );
      if (dtMatch) updated.discountTypeName = dtMatch.name;

      // Optimistically update UI so user sees it immediately
      this.$set
        ? this.$set(this.additionalDiscountedProducts, index, updated)
        : this.additionalDiscountedProducts.splice(index, 1, updated);

      this.$emit("update:products", [...this.additionalDiscountedProducts]);
      console.log(updated);

      try {
        this.loadProducts = true;
        await ProductsService.updateEntityProduct(updated);

        this.fetchAdditionalDiscountedProducts(
          Number(this.$route?.params?.workOrderId)
        );
      } catch (err) {
        //this.fetchAdditionalDiscountedProducts(Number(this.$route?.params?.workOrderId));
        // optionally show error toast
      } finally {
        this.loadProducts = false;
      }
    },

    // Called when user clicks Edit action in BaseTable
    onEdit({ row, rowIndex } = {}) {
      if (this.readOnly) return;
      if (!row) return console.warn("Edit: no row provided");

      // ensure discount types are loaded by the modal (modal will load if needed)
      // show the edit modal and pass the row to pre-fill the form
      const refModal = this.$refs.editAdditionalDiscountModal;
      console.log("Modal ref:", refModal);
      if (refModal && typeof refModal.show === "function") {
        refModal.show(row, rowIndex);
      } else {
        // fallback to opening by DOM Bootstrap if someone wired differently
        console.warn("Edit modal ref not found or doesn't implement show()");
      }
    },

    async fetchAdditionalDiscountedProducts(workOrderId) {
      if (!workOrderId) return;
      this.loadProducts = true;
      try {
        const entities = await ProductsService.getAdditionalDiscountedProducts(
          Number(workOrderId)
        );

        const list = Array.isArray(entities)
          ? entities
          : entities?.items ?? entities?.data ?? [];

        this.additionalDiscountedProducts = list.map((e) => ({ ...e }));
        this.total = this.additionalDiscountedProducts.length;
      } catch (err) {
        console.error("Failed to load entity products:", err);
      } finally {
        this.loadProducts = false;
      }
    },

    async onModalSaved() {
      // payload could be the created/updated record — simply reload list
      const workOrderId = Number(
        this.$route?.params?.workOrderId || this.$route?.query?.workOrderId || 0
      );
      if (!workOrderId)
        return console.warn("No workOrderId to refresh products.");
      await this.fetchAdditionalDiscountedProducts(workOrderId);
    },

    formatMoney(n) {
      const num = parseFloat(n || 0);
      return num.toFixed(2);
    },
  },
};
</script>
