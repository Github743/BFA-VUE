<template>
  <div class="row align-items-center" style="margin-bottom: 2%">
    <div v-if="loading" class="col-12">Loading work order...</div>
    <div v-else-if="error" class="col-12 text-danger">Error: {{ error }}</div>
    <template v-else-if="workOrder">
      <div class="col-12 col-lg-9 strong">
        <strong>Work Order {{ workOrder.workOrderId }}</strong
        >:
        {{ workOrder.workOrderName }}
        <span> - {{ workOrder.detail }} </span>
      </div>
      <div class="col-12 col-lg-3 text-lg-end text-start strong">
        <!-- text-start on small, text-end on large -->
        Status : {{ workOrder.workOrderStatus }}
      </div>
    </template>
  </div>
</template>


<script>
import { get } from "@/modules/shared/api/http";

export default {
  name: "WorkOrderSnapshot",
  props: {
    workOrderId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      workOrder: null,
      loading: false,
      error: null,
    };
  },
  watch: {
    workOrderId(newId, oldId) {
      if (newId !== oldId) this.fetchWorkOrder(newId);
    },
  },
  mounted() {
    this.fetchWorkOrder(this.workOrderId);
  },
  methods: {
    async fetchWorkOrder(id) {
      if (!id && id !== 0) return;
      this.loading = true;
      this.error = null;

      try {
        this.workOrder = await get(`workorder/${id}`);
        this.$emit("filled", this.workOrder);
      } catch (err) {
        this.error =
          (err?.response?.data && JSON.stringify(err.response.data)) ||
          err.message ||
          "Failed to fetch work order";
        this.workOrder = null;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.col-lg-9 {
  width: 75%;
}

.strong {
  font-weight: 500;
  color: #004990;
}
</style>
