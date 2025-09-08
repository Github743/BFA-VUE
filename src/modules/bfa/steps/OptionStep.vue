<template>
  <div class="container py-1">
    <h5 class="mb-3 margin-bottom-20 text-custom-blue">Certificate Type</h5>

    <div class="margin-top-20">
      <div class="form-check margin-top-20">
        <input
          class="form-check-input"
          :class="{ 'is-invalid': errors.certificate }"
          type="checkbox"
          id="MLC"
          name="IsMLCOption"
          value="MLC"
          v-model="certificateTypes"
          @change="onInputChange"
        />
        <label class="form-check-label" for="MLC"> MLC </label>
      </div>

      <div class="form-check margin-top-20">
        <input
          class="form-check-input"
          :class="{ 'is-invalid': errors.certificate }"
          type="checkbox"
          id="ISM"
          name="IsISMOption"
          v-model="certificateTypes"
          value="ISM"
          @change="onInputChange"
        />
        <label class="form-check-label" for="ISM"> ISM </label>
      </div>

      <div class="form-check margin-top-20">
        <input
          class="form-check-input"
          :class="{ 'is-invalid': errors.certificate }"
          type="checkbox"
          id="ISPS"
          name="IsISPSOption"
          v-model="certificateTypes"
          value="ISPS"
          @change="onInputChange"
        />
        <label class="form-check-label" for="ISPS"> ISPS </label>
      </div>

      <div v-if="errors.certificate" class="invalid-feedback d-block">
        {{ errors.certificate }}
      </div>

      <h5 class="mt-4 mb-3 text-custom-blue margin-top-20 margin-bottom-20">
        Additional Discounts
      </h5>

      <div class="form-check margin-top-20">
        <input
          class="form-check-input"
          type="checkbox"
          id="HasAdditionalDiscounts"
          name="HasAdditionalDiscounts"
          v-model="hasAdditionalDiscounts"
          @change="onInputChange"
        />
        <label class="form-check-label" for="HasAdditionalDiscounts">
          Include Additional Discounts
        </label>
      </div>

      <h5 class="mt-4 mb-3 text-custom-blue margin-top-20 margin-bottom-20">
        Additional Details
      </h5>

      <div class="row wp-flex wp-flex--align-center">
        <div class="col-lg-2">
          <label class="margin-bottom-0" for="EnrollmentDate"
            >Enrollment Date *</label
          >
        </div>
        <div class="col-lg-3 fieldlist">
          <input
            type="date"
            id="EnrollmentDate"
            v-model="selectedDate"
            class="form-control"
            :class="{ 'is-invalid': errors.enrollmentDate }"
            @input="onInputChange"
          />
          <div v-if="errors.enrollmentDate" class="invalid-feedback d-block">
            {{ errors.enrollmentDate }}
          </div>
        </div>
      </div>

      <div class="row margin-top-20 wp-flex wp-flex--align-center">
        <div class="col-lg-2">
          <label class="margin-bottom-0" for="AgreementText"
            >Agreement Text</label
          >
        </div>
        <div class="col-lg-3 fieldlist">
          <input
            type="text"
            name="AgreementText"
            id="AgreementText"
            class="form-control"
            v-model="agreementText"
            @input="onInputChange"
          />
        </div>
      </div>
    </div>
  </div>

  <StepButtons stepName="Options" @next="goNext" @save="saveOptions" />
</template>

<script>
import { ref } from "vue";
import StepButtons from "@/modules/shared/components/StepButtons.vue";
import { useClientStore } from "@/modules/customer/customerstore";

export default {
  name: "OptionStep",
  components: { StepButtons },
  emits: ["nextStep", "saveStep", "validationFailed", "validationCleared"],
  setup(props, { emit }) {
    const clientStore = useClientStore();

    // reactive state
    const certificateTypes = ref([]);
    const selectedDate = ref("");
    const hasAdditionalDiscounts = ref(false);
    const agreementText = ref(clientStore.selectedClient?.name || "");
    const errors = ref({ certificate: null, enrollmentDate: null });

    // validate() will be returned from setup so parent can call via $refs
    function validate() {
      // reset errors
      errors.value = { certificate: null, enrollmentDate: null };

      if (
        !Array.isArray(certificateTypes.value) ||
        certificateTypes.value.length === 0
      ) {
        errors.value.certificate =
          "Please select at least one certificate type.";
      }

      if (!selectedDate.value) {
        errors.value.enrollmentDate = "Enrollment date is required.";
      }

      const hasErr = !!(
        errors.value.certificate || errors.value.enrollmentDate
      );

      if (hasErr) {
        emit("validationFailed");
      } else {
        emit("validationCleared");
      }

      return !hasErr;
    }

    function goNext() {
      const ok = validate();
      if (ok) {
        emit("nextStep");
      }
    }

    function saveOptions() {
      const ok = validate();
      if (!ok) return;
      emit("saveStep");
    }

    function onInputChange() {
      if (errors.value.certificate || errors.value.enrollmentDate) {
        errors.value = { certificate: null, enrollmentDate: null };
        emit("validationCleared");
      }
    }

    return {
      certificateTypes,
      selectedDate,
      hasAdditionalDiscounts,
      agreementText,
      errors,
      goNext,
      saveOptions,
      validate,
      onInputChange,
    };
  },
};
</script>

<style scoped>
.text-custom-blue {
  color: #004990;
}

.margin-bottom-20 {
  margin-bottom: 20px !important;
}

.margin-top-20 {
  margin-top: 20px !important;
}

.margin-bottom-0 {
  margin-bottom: 0 !important;
}
</style>
