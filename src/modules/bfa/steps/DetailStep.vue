<template>
  <div class="container py-3">
    <!-- Vue-controlled tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'products' }"
          @click="activeTab = 'products'"
        >
          BFA Products
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'vessels' }"
          @click="activeTab = 'vessels'"
        >
          Vessels
        </button>
      </li>
    </ul>

    <!-- Vue-controlled tab content -->
    <div class="tab-content">
      <div v-show="activeTab === 'products'" class="tab-pane fade show active">
        <ProductGrid
          v-model:products="products"
          @save="saveProducts"
          @next="goToVessels"
        />
      </div>

      <div v-show="activeTab === 'vessels'" class="tab-pane fade show active">
        <p>Vessels content goes here...</p>
      </div>
    </div>
  </div>
</template>

<script>
import ProductGrid from "@/modules/shared/components/ProductGrid.vue";

export default {
  name: "DetailsStep",
  components: { ProductGrid },
  data() {
    return {
      activeTab: "products",
      products: [],
    };
  },
  methods: {
    saveProducts() {
      this.activeTab = "vessels";
    },
    goToVessels() {
      this.activeTab = "vessels";
    },
  },
};
</script>

<style scoped>
.nav-tabs .nav-link {
  color: #004990;
  font-weight: 500;
}

.nav-tabs .nav-link:hover {
  color: #002f66;
}

.nav-tabs .nav-link.active {
  background-color: #004990 !important;
  color: #fff !important;
  font-weight: bold;
  border-color: #004990 #004990 #fff !important;
}
</style>
