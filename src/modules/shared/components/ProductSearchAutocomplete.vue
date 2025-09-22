<template>
  <div class="d-flex flex-column align-items-center justify-content-center">
    <h4 class="text-danger fw-bold mb-3">{{ $route.meta.title }}</h4>
    <div
      ref="root"
      class="product-search position-relative w-100"
      style="max-width: 500px"
    >
      <!-- Search Bar -->
      <div class="input-group">
        <input
          type="text"
          v-model="searchQuery"
          class="form-control"
          placeholder="Enter Minimum 3 Characters To Search."
          @input="onInput"
        />

        <button class="btn btn-success" type="button" @click="triggerSearch">
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <i v-else class="bi bi-search"></i>
        </button>
      </div>

      <!-- Dropdown -->
      <ul
        v-if="showDropdown && searchQuery.length >= 3"
        class="list-group position-absolute w-100 mt-1 dropdown-list"
      >
        <template v-if="products && products.length > 0">
          <li
            v-for="product in products"
            :key="product.SytemProductName"
            class="list-group-item list-group-item-action"
            @click="selectProduct(product)"
          >
            <strong> {{ product.sytemProductName }}</strong>
          </li>
        </template>

        <template v-else>
          <li class="list-group-item text-muted text-center">
            No results found
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProductSearchAutocomplete",
  props: {
    products: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["start", "search", "select"],
  data() {
    return {
      searchQuery: "",
      selectedProduct: null,
      showDropdown: false,
      timer: null,
    };
  },
  methods: {
    onInput() {
      this.selectedClient = null;
      this.showDropdown = true;

      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if (this.searchQuery && this.searchQuery.length >= 3) {
          this.$emit("search", this.searchQuery);
        }
      }, 300);
    },

    triggerSearch() {
      if (this.searchQuery && this.searchQuery.length >= 3) {
        this.$emit("search", this.searchQuery);
        this.showDropdown = true;
      }
    },

    selectProduct(product) {
      this.searchQuery = `${product.SytemProductName}`;
      this.selectedProduct = product;
      this.showDropdown = false;
      this.$emit("select", product);
    },

    startSearch() {
      if (this.selectedproduct) {
        this.$emit("start", this.selectedproduct);
      }
    },

    onClickOutside(e) {
      if (!this.$refs.root.contains(e.target)) {
        this.showDropdown = false;
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.onClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.onClickOutside);
    if (this.timer) clearTimeout(this.timer);
  },
};
</script>

<style scoped>
.product-search {
  position: relative;
  max-width: 700px;
}
.list-group-item.text-muted.text-center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 48px;
}
.product-search .dropdown-list.w-100 {
  min-width: 100%;
}
.dropdown-list {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  background: #fff;
}
</style>