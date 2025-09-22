<template>
  <div class="container py-1">
    <h5 class="mb-3 margin-bottom-20 text-custom-blue">
      Certificate Type <span style="color: red">*</span>
    </h5>

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
          :disabled="readOnly"
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
          :disabled="readOnly"
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
          :disabled="readOnly"
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
          :disabled="readOnly"
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
            >Enrollment Date <span style="color: red">*</span></label
          >
        </div>
        <div class="col-lg-3 fieldlist">
          <flat-pickr
            v-model="selectedDate"
            :config="{ dateFormat: 'd-M-Y' }"
            class="form-control"
            id="enrollmentDate"
            :disabled="readOnly"
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
            :disabled="readOnly"
          />
        </div>
      </div>
    </div>

    <!-- Step buttons placed after form -->
    <div class="mt-4">
      <StepButtons
        stepName="Options"
        @next="goNext"
        @save="saveOptions"
        :read-only="readOnly"
      />
    </div>

    <!-- Loading overlay: placed last so it sits above the content -->
    <LoadingOverlay :visible="saveOption" />
  </div>
</template>

<script>
import StepButtons from "@/modules/shared/components/StepButtons.vue";
import LoadingOverlay from "@/modules/shared/components/LoadingOverlay.vue";
import { useOptionStep } from "@/modules/bfa/steps/OptionStep";
import FlatPickr from "vue-flatpickr-component";

export default {
  name: "OptionStep",
  props: {
    readOnly: { type: Boolean, default: false },
  },
  components: { StepButtons, LoadingOverlay, FlatPickr },
  emits: ["nextStep", "saveStep", "validationFailed", "validationCleared"],
  setup(props, { emit }) {
    return useOptionStep(emit);
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
