<template>
  <div class="container py-3">
    <!-- Tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'products' }"
          @click="setTab('products')"
        >
          BFA Products
        </button>
      </li>
      <li class="nav-item" v-if="showAdditionalTab">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'additionalDiscount' }"
          @click="setTab('additionalDiscount')"
        >
          Additional Discounts
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'vessels' }"
          @click="setTab('vessels')"
        >
          Vessels
        </button>
      </li>
    </ul>

    <!-- Tab content -->
    <div class="tab-content">
      <!-- Products -->
      <div v-show="activeTab === 'products'">
        <BfaProductGrid
          :workOrderId="workOrderId"
          v-model:products="bfaProducts"
          :read-only="readOnly"
          @save="saveProducts"
          @next="goToVessels"
        />
      </div>

      <!-- Additional Discounts -->
      <!-- Additional Discounts -->
      <div v-show="activeTab === 'additionalDiscount'">
        <AdditionalDiscount
          v-if="activeTab === 'additionalDiscount'"
          :workOrderId="workOrderId"
          v-model:products="additionalProducts"
          :read-only="readOnly"
          title="Additional Discounts"
        />
      </div>

      <!-- Vessels -->
      <div v-show="activeTab === 'vessels'">
        <div v-if="loadingVessels">Loading vessels...</div>
        <div v-else-if="vesselsError" class="text-danger">
          {{ vesselsError }}
        </div>
        <div v-else>
          <p v-if="!vessels || !vessels.length" class="text-muted">
            No vessels found.
          </p>
          <table v-else class="table table-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>IMO / Reg</th>
                <th>Flag</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in vessels" :key="v.id ?? v.vesselId ?? v.imo">
                <td>{{ v.name ?? v.vesselName ?? "—" }}</td>
                <td>{{ v.imo ?? v.registration ?? "—" }}</td>
                <td>{{ v.flag ?? "—" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BfaProductGrid from "@/modules/shared/components/ClientAgreement/BfaProductGrid.vue";
import AdditionalDiscount from "@/modules/shared/components/ClientAgreement/AdditionalDiscountGrid.vue";

import { useDetailStep } from "@/modules/bfa/steps/DetailStep";

export default {
  name: "DetailStep",
  props: {
    readOnly: { type: Boolean, default: false },
  },
  components: { BfaProductGrid, AdditionalDiscount },
  setup(props) {
    const {
      activeTab,
      bfaProducts,
      additionalProducts,
      vessels,
      showAdditionalTab,
      loadingAdditional,
      additionalError,
      loadingVessels,
      vesselsError,
      setTab,
      saveProducts,
      goToVessels,
      workOrderId,
    } = useDetailStep(props);

    return {
      activeTab,
      bfaProducts,
      additionalProducts,
      vessels,
      showAdditionalTab,
      loadingAdditional,
      additionalError,
      loadingVessels,
      vesselsError,
      setTab,
      saveProducts,
      goToVessels,
      workOrderId,
    };
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
