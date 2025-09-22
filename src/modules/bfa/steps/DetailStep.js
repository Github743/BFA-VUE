import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { get } from "@/modules/shared/api/http";

export function useDetailStep() {
  const route = useRoute();

  // state
  const activeTab = ref("products");
  const bfaProducts = ref([]);
  const additionalProducts = ref(null);
  const vessels = ref(null);

  const showAdditionalTab = ref(false);

  const loadingAdditional = ref(false);
  const additionalError = ref(null);

  const loadingVessels = ref(false);
  const vesselsError = ref(null);

  const workOrderId = computed(() =>
    Number(route.params?.workOrderId || route.query?.workOrderId || 0)
  );

  // --- API calls ---
  async function checkWorkOrderMeta(id) {
    if (!id) {
      showAdditionalTab.value = false;
      return;
    }
    try {
      const clientAgreement = await get(`ClientAgreement/${id}`);
      showAdditionalTab.value = Boolean(
        clientAgreement?.hasAdditionalDiscounts
      );
    } catch (err) {
      console.error("Failed to fetch workorder meta:", err);
      showAdditionalTab.value = false;
    }
  }

  // async function loadAdditionalIfNeeded() {
  //   if (additionalProducts.value !== null) return;
  //   if (!workOrderId.value) return;
  //   loadingAdditional.value = true;
  //   additionalError.value = null;
  //   try {
  //     const items = await get(
  //       `workorder/${workOrderId.value}/additional-discounts`
  //     );
  //     additionalProducts.value = Array.isArray(items) ? items : [];
  //   } catch (err) {
  //     console.error("Failed to load additional discounts:", err);
  //     additionalError.value =
  //       err?.message || "Failed to load additional discounts";
  //   } finally {
  //     loadingAdditional.value = false;
  //   }
  // }

  async function loadVesselsIfNeeded() {
    if (vessels.value !== null) return;
    if (!workOrderId.value) return;
    loadingVessels.value = true;
    vesselsError.value = null;
    try {
      const v = await get(`workorder/${workOrderId.value}/vessels`);
      vessels.value = Array.isArray(v) ? v : [];
    } catch (err) {
      console.error("Failed to load vessels:", err);
      vesselsError.value = err?.message || "Failed to load vessels";
    } finally {
      loadingVessels.value = false;
    }
  }

  // --- Tab management ---
  function setTab(tab) {
    activeTab.value = tab;
    if (tab === "additionalDiscount") {
      //loadAdditionalIfNeeded();
    } else if (tab === "vessels") {
      loadVesselsIfNeeded();
    }
  }

  function saveProducts() {
    setTab("vessels");
  }

  function goToVessels() {
    setTab("vessels");
  }

  // --- Lifecycle ---
  onMounted(() => {
    checkWorkOrderMeta(workOrderId.value);
  });

  return {
    // state
    activeTab,
    bfaProducts,
    additionalProducts,
    vessels,
    showAdditionalTab,
    loadingAdditional,
    additionalError,
    loadingVessels,
    vesselsError,

    // methods
    setTab,
    saveProducts,
    goToVessels,
    workOrderId,
  };
}
