<template>
  <div class="card p-3 shadow-sm mb-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="mb-0">{{ title }}</h6>
      <button class="btn btn-sm btn-primary" @click="openDiscountModal">
        Add discount
      </button>
    </div>

    <BaseTable :columns="columns" :rows="products"> </BaseTable>

    <AddDiscountModal
      :discountSchedules="discountSchedules"
      @add-discount="addProduct"
    />
  </div>
</template>

<script>
import { Modal } from "bootstrap";
import BaseTable from "@/modules/shared/components/BaseTable.vue";
import AddDiscountModal from "@/modules/shared/components/AddDiscountModal.vue";

export default {
  name: "ProductGrid",
  components: { BaseTable, AddDiscountModal },
  props: {
    products: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: "Products",
    },
  },
  data() {
    return {
      columns: [
        { label: "Product", field: "name" },
        { label: "Discount", field: "discount" },
        { label: "Discount Type", field: "type" },
      ],
      discountSchedules: [
        "10% - Seasonal",
        "15% - Loyalty",
        "20% - Bulk Order",
      ],
    };
  },
  methods: {
    openDiscountModal() {
      const modalEl = document.getElementById("addDiscountModal");
      const modal = new Modal(modalEl);
      modal.show();
    },
    addProduct(discount) {
      this.$emit("update:products", [
        ...this.products,
        { name: "New Product", discount, type: "Percentage" },
      ]);
    },
  },
};
</script>
