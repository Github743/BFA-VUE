import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showToast } from "@/modules/shared/utils/toast.js";
import { useBfaStore } from "@/modules/bfa/pages/bfaStore";
import {
  getOptionsForWorkOrder,
  mapApiToCertificateTypes,
  saveOptionsForWorkOrder,
  mapCertificateTypesToApi,
} from "@/modules/workorder/workorderApi";
import { useClientStore } from "@/modules/customer/customerstore";

export function useOptionStep(emit) {
  const route = useRoute();
  const router = useRouter();
  const clientStore = useClientStore();
  const bfaStore = useBfaStore();

  // reactive state
  const certificateTypes = ref([]);
  const selectedDate = ref("");
  const hasAdditionalDiscounts = ref(false);
  const agreementText = ref(clientStore.selectedClient?.name || "");
  const errors = ref({ certificate: null, enrollmentDate: null });

  // loading indicator
  const saveOption = ref(false);

  // Load options on mount
  onMounted(async () => {
    try {
      saveOption.value = true;
      const workOrderId = route.params.workOrderId;
      if (!workOrderId) return;

      const res = await getOptionsForWorkOrder(workOrderId);
      if (res) {
        selectedDate.value = res.enrollmentDate;
        certificateTypes.value = mapApiToCertificateTypes(res);
        hasAdditionalDiscounts.value = !!res.hasAdditionalDiscounts;
        agreementText.value = res.agreementText || "";
        bfaStore.setSystemDiscountScheduleName(res.systemDiscountScheduleName);
        bfaStore.setWorkOrderClientAgreementId(res.workOrderClientAgreementId);
        console.log(res.systemDiscountScheduleName);
      }
    } catch (err) {
      showToast("Invalid workorder id", "danger");
      router.replace({ name: "IssueBlockFeeAgreement" });
    } finally {
      saveOption.value = false;
    }
  });

  function validate() {
    errors.value = { certificate: null, enrollmentDate: null };

    if (!certificateTypes.value?.length) {
      errors.value.certificate = "Please select at least one certificate type.";
    }
    if (!selectedDate.value) {
      errors.value.enrollmentDate = "Enrollment date is required.";
    }

    const hasErr = !!(errors.value.certificate || errors.value.enrollmentDate);
    emit(hasErr ? "validationFailed" : "validationCleared");
    return !hasErr;
  }

  async function doSaveOptions(goNextAfter = false) {
    if (!validate()) return false;

    const workOrderId = route.params.workOrderId;
    if (!workOrderId) {
      showToast("Invalid workorder", "danger");
      return false;
    }

    const payload = {
      ...mapCertificateTypesToApi(certificateTypes.value),
      hasAdditionalDiscounts: !!hasAdditionalDiscounts.value,
      enrollmentDate: selectedDate.value || null,
      agreementText: agreementText.value || "",
    };

    try {
      saveOption.value = true;
      const res = await saveOptionsForWorkOrder(workOrderId, payload);

      if (res === false || res === undefined) {
        saveOption.value = false;
        return false;
      }

      emit("saveStep");
      if (goNextAfter) emit("nextStep");
      return true;
    } catch (err) {
      showToast("Failed to save options", "danger");
      return false;
    } finally {
      saveOption.value = false;
    }
  }

  async function saveOptions() {
    await doSaveOptions(false);
  }

  async function goNext() {
    await doSaveOptions(true);
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
    saveOption,
    goNext,
    saveOptions,
    validate,
    onInputChange,
  };
}
