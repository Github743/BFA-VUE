<template>
  <div
    class="modal fade"
    id="additionalDiscountModal"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Add Additional Discount</h5>
          <button
            class="btn-close btn-close-white"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <div class="modal-body">
          <div class="d-flex gap-3 mb-3 align-items-center">
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                id="optService"
                value="service"
                v-model="mode"
              />
              <label class="form-check-label" for="optService">Service</label>
            </div>

            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                id="optProduct"
                value="product"
                v-model="mode"
              />
              <label class="form-check-label" for="optProduct">Product</label>
            </div>
          </div>

          <!-- SERVICE -->
          <div v-if="mode === 'service'" class="mb-3">
            <label class="form-label fw-bold">Select Service</label>
            <select
              v-model="selectedServiceId"
              class="form-select service-select"
            >
              <option value="-1">Select service</option>
              <option
                v-for="s in services"
                :key="s.LookupId ?? s.lookupId ?? s.id"
                :value="s.LookupId ?? s.lookupId ?? s.id"
              >
                {{ s.name ?? s.DisplayName ?? s.displayName }}
              </option>
            </select>
          </div>

          <!-- PRODUCT -->
          <div v-else>
            <label class="form-label fw-bold">Select Product</label>

            <div class="mb-2">
              <ProductSearchAutocomplete
                v-show="!selectedProduct"
                :products="products"
                :loading="loadingProducts"
                @select="onSelect"
                @search="onSearch"
              />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-secondary"
            data-bs-dismiss="modal"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!canSave"
            @click="onSave"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProductsService from "@/modules/shared/services/Products.js";
import ProductSearchAutocomplete from "@/modules/shared/components/ProductSearchAutocomplete.vue";

export default {
  name: "AdditionalDiscountModal",
  components: { ProductSearchAutocomplete },
  props: { readOnly: { type: Boolean, default: false } },
  data() {
    return {
      mode: "service",
      selectedServiceId: "-1",
      selectedProductId: null,

      services: [],
      products: [],

      loadingProducts: false,
      selectedProduct: null,
    };
  },
  async mounted() {
    // load service groups; normalize shape
    try {
      const raw = (await ProductsService.getProductGroupTypes?.()) ?? [];
      this.services = Array.isArray(raw)
        ? raw.map((s) => ({
            LookupId: s.LookupId ?? s.lookupId ?? s.id,
            name:
              s.name ??
              s.DisplayName ??
              s.displayName ??
              s.lookupName ??
              s.name,
          }))
        : [];
    } catch (err) {
      console.error("Failed to load product group types", err);
      this.services = [];
    }
  },
  watch: {
    // when switching back to service mode reset product selection
    mode(newMode) {
      if (newMode === "service") {
        this.selectedProduct = null;
        this.selectedProductId = null;
        this.products.value = [];
      }
    },
  },
  computed: {
    // filter kept for backward compatibility (not strictly required when using API results)
    filteredProducts() {
      const q = (this.selectedProduct ? "" : "").trim().toLowerCase();
      return q
        ? this.products.filter((p) =>
            `${p.name} ${p.sku}`.toLowerCase().includes(q)
          )
        : this.products;
    },
    selectedService() {
      const id = this.selectedServiceId;
      return (
        this.services.find((s) => String(s.LookupId) === String(id)) || null
      );
    },
    selectedProductComputed() {
      return (
        this.selectedProduct ||
        this.products.find(
          (p) => String(p.sytemProductName) === String(this.sytemProductName)
        ) ||
        null
      );
    },
    canSave() {
      if (this.mode === "service") {
        return (
          this.selectedServiceId && String(this.selectedServiceId) !== "-1"
        );
      } else {
        return !!this.selectedProductId && !!this.selectedProduct;
      }
    },
  },
  methods: {
    formatPrice(n) {
      return (Number(n) || 0).toFixed(2);
    },

    // called when the child emits `search` (query)
    async onSearch(query) {
      if (!query || String(query).trim().length < 3) {
        this.products = [];
        return;
      }
      this.loadingProducts = true;
      try {
        // call service search API (adjust method name if different)
        let res = null;

        res = await ProductsService.getProductByName(query);

        if (Array.isArray(res)) {
          this.products = res;
        } else {
          this.products = [];
        }
        //console.log(this.products);
      } catch (err) {
        console.error("Product search failed:", err);
        this.products = [];
      } finally {
        this.loadingProducts = false;
      }
    },

    // called when the child emits `select`
    onSelect(product) {
      // product is whatever the child passed (your earlier version passed original object)
      // try to normalize id/name
      const id =
        product.id ??
        product.productId ??
        product.systemProductId ??
        product.SystemProductId;
      this.selectedProductId = id;
      this.selectedProduct = {
        ...product,
        id,
        name: product.name ?? product.systemProductName ?? product.productName,
      };

      // optionally close the child dropdown by letting child hide via v-show logic (v-show uses selectedProduct)
      // your ProductSearchAutocomplete uses v-show="!selectedProduct" so it hides automatically
    },

    onSave() {
      if (this.mode === "service") {
        this.$emit("saved", { type: "service", item: this.selectedService });
      } else {
        this.$emit("saved", { type: "product", item: this.selectedProduct });
      }
      // optionally hide modal programmatically:
      const el = document.getElementById("additionalDiscountModal");
      try {
        const { Modal } = require("bootstrap");
        const m = Modal.getInstance(el) ?? new Modal(el);
        m.hide();
      } catch (e) {
        // ignore if bootstrap not available as require/import
      }
    },
  },
};
</script>

<style scoped>
.table tbody tr {
  cursor: pointer;
}
.table tbody tr.table-active {
  background: rgba(13, 110, 253, 0.06);
}
.service-select {
  max-height: 40px; /* just controls the closed control’s height */
  overflow-y: auto; /* does NOT affect the opened dropdown */
}

.dropdown-list {
  z-index: 1205;
}
</style>
