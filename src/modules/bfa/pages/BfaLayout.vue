<template>
  <div class="container py-4" style="margin-left: -28px">
    <div class="stepper mb-4">
      <div
        v-for="(step, i) in steps"
        :key="i"
        class="step"
        :class="{
          active: currentStep === step.path,
          completed: i < steps.findIndex((s) => s.path === currentStep),
          error: step.hasError,
        }"
        @click="handleStepClick(step)"
      >
        {{ step.label }}
      </div>
    </div>

    <div class="card p-4 shadow-sm bg-white">
      <keep-alive>
        <component
          :is="getCurrentComponent()"
          ref="stepCompRef"
          @nextStep="goToNextStep"
        />
      </keep-alive>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import OptionStep from "@/modules/bfa/steps/OptionStep.vue";
import DetailStep from "@/modules/bfa/steps/DetailStep.vue";

const steps = ref([
  { label: "OPTIONS", path: "options", component: OptionStep, hasError: false },
  { label: "DETAILS", path: "details", component: DetailStep, hasError: false },
  { label: "DOCUMENTS", path: "documents", hasError: false },
  { label: "INVOICE", path: "invoice", hasError: false },
  { label: "FINAL REVIEW", path: "final-review", hasError: false },
  { label: "SIGNED & RECEIVED", path: "signed-received", hasError: false },
]);

const currentStep = ref("options");

const stepCompRef = ref(null);

const getCurrentComponent = () => {
  const step = steps.value.find((s) => s.path === currentStep.value);
  return step ? step.component : null;
};

const goToNextStep = () => {
  const index = steps.value.findIndex((s) => s.path === currentStep.value);
  if (index !== -1 && index < steps.value.length - 1) {
    steps.value[index].hasError = false;
    currentStep.value = steps.value[index + 1].path;
  }
};

const handleStepClick = async (step) => {
  if (step.path === currentStep.value) return;
  if (currentStep.value === "options") {
    const comp = stepCompRef.value;
    if (comp && typeof comp.validate === "function") {
      const ok = await comp.validate();
      const optionsIndex = steps.value.findIndex((s) => s.path === "options");
      if (optionsIndex !== -1) {
        steps.value[optionsIndex].hasError = !ok;
      }
    }
  }

  currentStep.value = step.path;
};
</script>

<style scoped>
.stepper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}
.step {
  flex: 1;
  text-align: center;
  position: relative;
  padding: 12px 0;
  font-weight: bold;
  color: #0d3c78;
  cursor: pointer;
  background: #fff;
  clip-path: polygon(
    0 0,
    calc(100% - 15px) 0,
    100% 50%,
    calc(100% - 15px) 100%,
    0 100%,
    15px 50%
  );
  border: 1px solid #ddd;
  z-index: 1;
}
.step:last-child {
  margin-right: 0;
}
.step.active {
  background: #004b91;
  color: white;
}
.step.completed {
  border-bottom: 4px solid green;
}
.step:not(.active):not(.completed) {
  background: #fff;
  color: #0d3c78;
}

.step.error {
  border-bottom: 4px solid #d9534f;
}
</style>
