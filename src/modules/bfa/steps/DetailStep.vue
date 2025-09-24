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
          BFA Products {{ SystemDiscountScheduleName }}
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
        {{ SystemDiscountScheduleName }}
        <BfaProductGrid
          :workOrderId="workOrderId"
          v-model:products="bfaProducts"
          :read-only="readOnly"
          @save="saveProducts"
          @next="goToVessels"
        />
      </div>

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
import { inject, onMounted, onBeforeUnmount, watch } from "vue";
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
      SystemDiscountScheduleName,
      vesselsError,
      setTab,
      saveProducts,
      goToVessels,
      workOrderId,
    } = useDetailStep(props);

    // Parent APIs (may be null — guard calls)
    const registerValidator = inject("bfa-register-validator", null);
    const unregisterValidator = inject("bfa-unregister-validator", null);
    const setStepError = inject("bfa-set-step-error", null);
    const setStepMessage = inject("bfa-set-step-message", null);

    const STEP_PATH = "details";

    // Validator used by parent (returns boolean)
    const detailsValidator = () => {
      const hasProducts =
        Array.isArray(bfaProducts.value) && bfaProducts.value.length > 0;
      if (showAdditionalTab.value) {
        const hasAdditional =
          Array.isArray(additionalProducts.value) &&
          additionalProducts.value.length > 0;
        return hasProducts && hasAdditional;
      }
      return hasProducts;
    };

    // Compute human-readable messages for Final Review
    const computeMessages = () => {
      const msgs = [];
      if (!Array.isArray(bfaProducts.value) || bfaProducts.value.length === 0) {
        msgs.push("No Products are selected for the client.");
      }
      if (showAdditionalTab.value) {
        if (
          !Array.isArray(additionalProducts.value) ||
          additionalProducts.value.length === 0
        ) {
          msgs.push("No Additional Discounts are selected for the client.");
        }
      }
      return msgs;
    };

    // Register validator and set initial state/messages
    onMounted(() => {
      if (typeof registerValidator === "function") {
        try {
          registerValidator(STEP_PATH, detailsValidator);
        } catch (e) {
          // swallow
          // console.warn("registerValidator failed", e);
        }
      }

      // initial boolean error + messages
      const valid = detailsValidator();
      if (typeof setStepError === "function") {
        try {
          setStepError(STEP_PATH, !valid);
        } catch (e) {
          console.log(e);
        }
      }
      if (typeof setStepMessage === "function") {
        try {
          setStepMessage(STEP_PATH, computeMessages());
        } catch (e) {
          console.log(e);
        }
      }
    });

    onBeforeUnmount(() => {
      if (typeof unregisterValidator === "function") {
        try {
          unregisterValidator(STEP_PATH);
        } catch (e) {
          console.log(e);
        }
      }
      // clear messages on unmount
      if (typeof setStepMessage === "function") {
        try {
          setStepMessage(STEP_PATH, null);
        } catch (e) {
          console.log(e);
        }
      }
    });

    // Watch products -> update parent's error + messages
    watch(
      () => bfaProducts.value,
      (newVal) => {
        const hasProducts = Array.isArray(newVal) && newVal.length > 0;
        const valid =
          hasProducts ||
          (showAdditionalTab.value &&
            Array.isArray(additionalProducts.value) &&
            additionalProducts.value.length > 0);

        if (typeof setStepError === "function") {
          try {
            setStepError(STEP_PATH, !valid);
          } catch (e) {
            console.log(e);
          }
        }
        if (typeof setStepMessage === "function") {
          try {
            setStepMessage(STEP_PATH, computeMessages());
          } catch (e) {
            console.log(e);
          }
        }
      },
      { immediate: true, deep: true }
    );

    // Watch additionalProducts -> update parent's error + messages (only if additional tab is shown)
    watch(
      () => additionalProducts.value,
      (newVal) => {
        if (!showAdditionalTab.value) return;

        const hasAdditional = Array.isArray(newVal) && newVal.length > 0;
        const valid =
          hasAdditional ||
          (Array.isArray(bfaProducts.value) && bfaProducts.value.length > 0);

        if (typeof setStepError === "function") {
          try {
            setStepError(STEP_PATH, !valid);
          } catch (e) {
            console.log(e);
          }
        }
        if (typeof setStepMessage === "function") {
          try {
            setStepMessage(STEP_PATH, computeMessages());
          } catch (e) {
            console.log(e);
          }
        }
      },
      { immediate: true, deep: true }
    );

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
      SystemDiscountScheduleName,
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
