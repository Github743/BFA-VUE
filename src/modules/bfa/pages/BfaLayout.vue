<template>
  <div class="container py-4" style="margin-left: -28px">
    <div class="stepper mb-4">
      <div
        v-for="(step, i) in steps"
        :key="step.path"
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
    <WorkOrderSnapshot
      :workOrderId="Number(route.params.workOrderId)"
      @filled="onWorkOrderFilled"
    />
    <div class="card p-4 shadow-sm bg-white">
      <component
        :is="getCurrentComponent()"
        :key="currentStep"
        ref="stepCompRef"
        @nextStep="goToNextStep"
        :read-only="isReadOnly"
        :work-order="workOrderForChildren"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, markRaw, watch, provide, nextTick } from "vue";
import OptionStep from "@/modules/bfa/steps/OptionStep.vue";
import DetailStep from "@/modules/bfa/steps/DetailStep.vue";
import { useRoute, useRouter } from "vue-router";
import WorkOrderSnapshot from "@/modules/shared/components/WorkOrderSnapShot.vue";
import { WORK_ORDER_STATUSES } from "@/constants/workOrder.js";

/* router + route */
const route = useRoute();
const router = useRouter();

const workOrderForChildren = ref(null);
const isReadOnly = ref(false);

function onWorkOrderFilled(wo) {
  workOrderForChildren.value = wo;
  const status = (wo?.workOrderStatus || "").toLowerCase();
  isReadOnly.value = [
    WORK_ORDER_STATUSES.ACTIVE,
    WORK_ORDER_STATUSES.DELETED,
    WORK_ORDER_STATUSES.PENDINGAPPROVAL,
  ].includes(status);
}

/* steps list - markRaw avoids Vue proxying the component constructors */
const steps = ref([
  {
    label: "OPTIONS",
    path: "options",
    component: markRaw(OptionStep),
    hasError: false,
  },
  {
    label: "DETAILS",
    path: "details",
    component: markRaw(DetailStep),
    hasError: false,
  },
  { label: "DOCUMENTS", path: "documents", hasError: false },
  { label: "INVOICE", path: "invoice", hasError: false },
  { label: "FINAL REVIEW", path: "final-review", hasError: false },
  { label: "SIGNED & RECEIVED", path: "signed-received", hasError: false },
]);

const currentStep = ref(route.params.step || "options");
watch(
  () => route.params.step,
  (s) => {
    if (s) currentStep.value = s;
  }
);

const stepCompRef = ref(null);

const validators = new Map();

const registerValidator = (path, fn) => {
  if (!path || typeof fn !== "function") return;
  validators.set(path, fn);
};
const unregisterValidator = (path) => {
  validators.delete(path);
};

provide("bfa-register-validator", registerValidator);
provide("bfa-unregister-validator", unregisterValidator);

const runValidatorFor = async (stepPath) => {
  const idx = steps.value.findIndex((s) => s.path === stepPath);
  if (idx === -1) return true;

  const regFn = validators.get(stepPath);
  if (typeof regFn === "function") {
    try {
      const r = regFn();
      const ok = r instanceof Promise ? await r : r;
      steps.value[idx].hasError = !ok;
      return !!ok;
    } catch (e) {
      steps.value[idx].hasError = true;
      return false;
    }
  }

  if (
    stepPath === currentStep.value &&
    stepCompRef.value &&
    typeof stepCompRef.value.validate === "function"
  ) {
    try {
      await nextTick();
      const r = stepCompRef.value.validate();
      const ok = r instanceof Promise ? await r : r;
      steps.value[idx].hasError = !ok;
      return !!ok;
    } catch (e) {
      steps.value[idx].hasError = true;
      return false;
    }
  }

  steps.value[idx].hasError = false;
  return true;
};

const getCurrentComponent = () => {
  const s = steps.value.find((x) => x.path === currentStep.value);
  return s ? s.component : null;
};

const goToNextStep = async () => {
  const index = steps.value.findIndex((s) => s.path === currentStep.value);
  if (index === -1 || index >= steps.value.length - 1) return;

  await runValidatorFor(currentStep.value);
  currentStep.value = steps.value[index + 1].path;
  router.push({
    name: "BfaStepper",
    params: { step: currentStep.value, workOrderId: route.params.workOrderId },
  });
};

const handleStepClick = async (step) => {
  try {
    if (step.path === currentStep.value) return;

    const leavingStep = currentStep.value;
    const leavingIndex = steps.value.findIndex((s) => s.path === leavingStep);

    await nextTick();

    const valid = await runValidatorFor(leavingStep);

    // ensure hasError set
    if (leavingIndex !== -1) {
      steps.value[leavingIndex].hasError = !valid;
    }

    await nextTick();

    await new Promise((res) => setTimeout(res, 40));

    router.push({
      name: "BfaStepper",
      params: { step: step.path, workOrderId: route.params.workOrderId },
    });
  } catch (err) {
    router.push({
      name: "BfaStepper",
      params: { step: step.path, workOrderId: route.params.workOrderId },
    });
  }
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


