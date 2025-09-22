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
    >
      <template #amount="{ row }">{{ formatMoney(row.amount) }}</template>
    </BaseTable>

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
    title: { type: String, default: "Discount Schedules" },
  },

  data() {
    return {
      additionalDiscountedProducts: [],
      loadProducts: false,
      discountTypes: [],
      columns: [
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
        { label: "Date", field: "creationDate", type: "date" },
      ],
    };
  },

  async mounted() {
    const workOrderId = Number(
      this.$route?.params?.workOrderId || this.$route?.query?.workOrderId || 0
    );
    if (workOrderId) await this.fetchEntityProducts(workOrderId);
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

    async fetchEntityProducts(workOrderId) {
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
      await this.fetchEntityProducts(workOrderId);
    },

    formatMoney(n) {
      const num = parseFloat(n || 0);
      return num.toFixed(2);
    },
  },
};
</script>
