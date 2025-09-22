<template>
  <div class="border-top mt-5 pt-3">
    <div class="row">
      <div class="col-sm-6"></div>
      <div class="col-sm-6 text-end">
        <button
          v-if="!readOnly && stepName === 'Options'"
          class="btn btn-outline-secondary me-2"
          @click="$emit('save')"
        >
          Save
        </button>
        <button
          v-if="!readOnly && buttonLabel"
          class="btn btn-primary"
          @click="$emit('next')"
        >
          {{ buttonLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StepButtons",
  props: {
    stepName: {
      type: String,
      required: true,
    },
    readOnly: { type: Boolean, default: false },
  },
  computed: {
    buttonLabel() {
      switch (this.stepName) {
        case "Invoice":
          return "Continue";
        case "FinalReview":
          return "Submit for Approval";
        case "Signed & Received":
          return null;
        default:
          return "Continue";
      }
    },
  },
};
</script>

<style scoped>
button {
  min-width: 180px;
}
</style>