<template>
  <div class="final-review p-3">
    <h3>Final Review</h3>

    <div v-if="!validationSteps || validationSteps.length === 0">
      <p>No steps configured.</p>
    </div>

    <ul class="list-unstyled">
      <li v-for="s in validationSteps" :key="s.path" class="mb-3">
        <div style="display: flex; align-items: center; gap: 10px">
          <strong>{{ s.label }}:</strong>

          <!-- Complete -->
          <span v-if="!s.hasError" style="color: green; font-weight: 600">
            <i class="bi bi-check-circle-fill"></i> Complete
          </span>

          <!-- Incomplete -->
          <span v-else style="color: #b1272a; font-weight: 600">
            <i class="bi bi-x-circle-fill"></i> Incomplete
          </span>

          <button
            v-if="s.hasError"
            class="btn btn-sm btn-link"
            @click="goto(s.path)"
          >
            Go to step
          </button>
        </div>

        <div
          v-if="validationMessages && validationMessages[s.path]"
          style="margin-left: 1rem; margin-top: 6px"
        >
          <div
            v-for="(m, idx) in validationMessages[s.path]"
            :key="idx"
            style="color: #b1272a"
          >
            • {{ m }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps, toRefs } from "vue";

/**
 * defineProps with default factories makes props safer (for objects/arrays).
 * Using toRefs keeps each prop as a reactive ref so you can pass them around.
 */
const props = defineProps({
  validationSteps: {
    type: Array,
    default: () => [],
  },
  validationMessages: {
    type: Object,
    default: () => ({}),
  },
  // accept a function prop (optional)
  goToStep: {
    type: Function,
    default: null,
  },
});

// create reactive refs for easier usage (optional but handy)
const { validationSteps, validationMessages, goToStep } = toRefs(props);

const goto = (path) => {
  // goToStep may be null; call safely
  if (goToStep?.value) goToStep.value(path);
};
</script>

<style scoped>
.final-review {
  padding: 12px;
}
</style>
