<template>
  <div class="container py-4" style="margin-left: -28px">
    <div class="stepper mb-4">
      <div
        v-for="(step, i) in steps"
        :key="step.path"
        class="step"
        :class="{
          active: currentStep === step.path,
          completed: i < currentIndex && !step.hasError,
          error: step.hasError,
        }"
        @click="handleStepClick(step)"
        tabindex="0"
        role="button"
        :data-index="i"
      >
        {{ step.label }}
      </div>
    </div>

    <WorkOrderSnapshot
      :workOrderId="Number(route.params.workOrderId)"
      @filled="onWorkOrderFilled"
    />

    <div class="card p-4 shadow-sm bg-white">
      <!-- When showing final-review we pass reactive steps + messages so FinalReview
           can display live messages computed by children -->
      <component
        :is="getCurrentComponent()"
        :key="currentStep"
        ref="stepCompRef"
        @nextStep="goToNextStep"
        :read-only="isReadOnly"
        :work-order="workOrderForChildren"
        v-bind="currentStep === 'final-review' ? finalReviewProps : {}"
      />
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  markRaw,
  watch,
  provide,
  nextTick,
  computed,
  onMounted,
  reactive,
} from "vue";
import { useRoute, useRouter } from "vue-router";

import OptionStep from "@/modules/bfa/steps/OptionStep.vue";
import DetailStep from "@/modules/bfa/steps/DetailStep.vue";
import FinalReview from "@/modules/bfa/steps/FinalReview.vue";
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

/* steps list - include FinalReview component */
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
  {
    label: "FINAL REVIEW",
    path: "final-review",
    component: markRaw(FinalReview),
    hasError: false,
  },
  { label: "SIGNED & RECEIVED", path: "signed-received", hasError: false },
]);

const currentStep = ref(route.params.step || "options");
watch(
  () => route.params.step,
  (s) => {
    if (s) currentStep.value = s;
  }
);

const currentIndex = computed(() =>
  steps.value.findIndex((s) => s.path === currentStep.value)
);
const stepCompRef = ref(null);

/* --- persistence helpers (sessionStorage) --- */
const getPersistKey = (workOrderId) =>
  `bfa_step_errors_${workOrderId || "global"}`;

const persistErrorsForWorkOrder = (workOrderId) => {
  try {
    const map = {};
    steps.value.forEach((s) => {
      if (s.hasError) map[s.path] = true;
    });
    sessionStorage.setItem(getPersistKey(workOrderId), JSON.stringify(map));
  } catch (e) {
    console.error("persistErrorsForWorkOrder:", e);
  }
};

const loadPersistedErrors = (workOrderId) => {
  try {
    const raw = sessionStorage.getItem(getPersistKey(workOrderId));
    if (!raw) return;
    const map = JSON.parse(raw) || {};
    steps.value.forEach((s) => {
      s.hasError = !!map[s.path];
    });
  } catch (e) {
    console.error("loadPersistedErrors:", e);
  }
};

const clearPersistedErrorForPath = (workOrderId, path) => {
  try {
    const raw = sessionStorage.getItem(getPersistKey(workOrderId));
    if (!raw) return;
    const map = JSON.parse(raw) || {};
    if (map[path]) {
      delete map[path];
      sessionStorage.setItem(getPersistKey(workOrderId), JSON.stringify(map));
    }
  } catch (e) {
    console.error("clearPersistedErrorForPath:", e);
  }
};

onMounted(() => loadPersistedErrors(route.params.workOrderId));
watch(
  () => route.params.workOrderId,
  (woId) => loadPersistedErrors(woId)
);

/* --- validator registry --- */
const validators = new Map();
const registerValidator = (path, fn) => {
  if (!path || typeof fn !== "function") return;
  validators.set(path, fn);
};
const unregisterValidator = (path) => validators.delete(path);
provide("bfa-register-validator", registerValidator);
provide("bfa-unregister-validator", unregisterValidator);

/* --- step messages store & provider --- */
const stepMessages = reactive({}); // { [path]: string[] }
const setStepMessage = (path, messages) => {
  if (!path) return;
  // treat empty or null as "clear"
  if (!messages || (Array.isArray(messages) && messages.length === 0)) {
    if (stepMessages[path]) delete stepMessages[path];
    return;
  }
  stepMessages[path] = Array.isArray(messages)
    ? messages.slice()
    : [String(messages)];
};
provide("bfa-set-step-message", setStepMessage);

/* run validator for a step */
const runValidatorFor = async (stepPath) => {
  const idx = steps.value.findIndex((s) => s.path === stepPath);
  if (idx === -1) return true;

  const regFn = validators.get(stepPath);
  if (typeof regFn === "function") {
    try {
      const r = regFn();
      const ok = r instanceof Promise ? await r : r;
      steps.value[idx].hasError = !ok;
      if (ok) clearPersistedErrorForPath(route.params.workOrderId, stepPath);
      else persistErrorsForWorkOrder(route.params.workOrderId);
      return !!ok;
    } catch (e) {
      steps.value[idx].hasError = true;
      persistErrorsForWorkOrder(route.params.workOrderId);
      console.error("runValidatorFor (registered) threw:", e);
      return false;
    }
  }

  // if active component exposes validate()
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
      if (ok) clearPersistedErrorForPath(route.params.workOrderId, stepPath);
      else persistErrorsForWorkOrder(route.params.workOrderId);
      return !!ok;
    } catch (e) {
      steps.value[idx].hasError = true;
      persistErrorsForWorkOrder(route.params.workOrderId);
      console.error("runValidatorFor (component.validate) threw:", e);
      return false;
    }
  }

  // preserve previous state if nothing to run
  return !steps.value[idx].hasError;
};

/* run all validators (used before showing final review) */
const runAllValidators = async () => {
  const results = [];
  const list = steps.value.slice();
  for (const s of list) {
    const ok = await runValidatorFor(s.path);
    results.push({
      path: s.path,
      label: s.label,
      ok,
      messages: stepMessages[s.path] || [],
    });
  }
  // helpful debug:
  // console.debug("runAllValidators results:", results, "stepMessages:", JSON.parse(JSON.stringify(stepMessages)));
  return results;
};

const getCurrentComponent = () => {
  const s = steps.value.find((x) => x.path === currentStep.value);
  return s ? s.component : null;
};

/* navigation helpers */
const goToNextStep = async () => {
  const index = steps.value.findIndex((s) => s.path === currentStep.value);
  if (index === -1 || index >= steps.value.length - 1) return;

  const valid = await runValidatorFor(currentStep.value);
  steps.value[index].hasError = !valid;

  // allow navigation even when invalid (but mark error)
  currentStep.value = steps.value[index + 1].path;
  router.push({
    name: "BfaStepper",
    params: { step: currentStep.value, workOrderId: route.params.workOrderId },
  });
};

const goToStep = (path) => {
  router.push({
    name: "BfaStepper",
    params: { step: path, workOrderId: route.params.workOrderId },
  });
};

/* handle clicking a step in the header */
const handleStepClick = async (step) => {
  try {
    if (step.path === currentStep.value) return;

    // If user clicked Final Review, ensure we run all validators first (so messages are prepared)
    if (step.path === "final-review") {
      await runAllValidators();
      await nextTick();
      // small delay gives DOM chance to update
      await new Promise((res) => setTimeout(res, 30));
      router.push({
        name: "BfaStepper",
        params: { step: "final-review", workOrderId: route.params.workOrderId },
      });
      return;
    }

    const leavingStep = currentStep.value;
    const leavingIndex = steps.value.findIndex((s) => s.path === leavingStep);

    await nextTick();
    const valid = await runValidatorFor(leavingStep);

    if (leavingIndex !== -1) {
      steps.value[leavingIndex].hasError = !valid;
      persistErrorsForWorkOrder(route.params.workOrderId);
    }

    await nextTick();
    router.push({
      name: "BfaStepper",
      params: { step: step.path, workOrderId: route.params.workOrderId },
    });
  } catch (err) {
    console.error("handleStepClick error:", err);
    router.push({
      name: "BfaStepper",
      params: { step: step.path, workOrderId: route.params.workOrderId },
    });
  }
};

/* props to pass to FinalReview (use ref/reactive objects, not frozen snapshot) */
const finalReviewProps = {
  validationSteps: steps, // pass the reactive ref (FinalReview can consume it)
  validationMessages: stepMessages,
  goToStep,
};
</script>

<style scoped>
.stepper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

/* base step */
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

  /* reserve space for bottom border */
  border-bottom: 4px solid transparent;
}

.step:last-child {
  margin-right: 0;
}

.step.active {
  background: #004b91;
  color: white;
}

/* completed uses border-bottom-color so base border stays consistent */
.step.completed {
  border-bottom-color: green;
}

.step:not(.active):not(.completed) {
  background: #fff;
  color: #0d3c78;
}

/* error visual: explicit override of bottom color */
.step.error {
  border-bottom-color: #d9534f;
}

/* defensive: if both classes somehow exist, ensure error color wins */
.step.completed.error,
.step.error.completed {
  border-bottom-color: #d9534f;
}

.step:focus {
  outline: 3px solid rgba(217, 83, 79, 0.15);
  outline-offset: 4px;
}
</style>
