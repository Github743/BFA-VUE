<template>
  <div
    class="modal fade"
    id="addDiscountModal"
    tabindex="-1"
    aria-labelledby="addDiscountModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title" id="addDiscountModalLabel">Add Discount</h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <div class="mb-3">
            <label for="discountSchedule" class="form-label">
              Pick Discounted Schedule
            </label>
            <select
              id="discountSchedule"
              class="form-select"
              v-model="selectedDiscount"
              :class="{ 'is-invalid': error }"
            >
              <option value="">Please Select a Discount Schedule</option>
              <option
                v-for="(schedule, index) in discountSchedules"
                :key="index"
                :value="schedule"
              >
                {{ schedule }}
              </option>
            </select>
            <!-- Validation Message -->
            <div v-if="error" class="invalid-feedback">
              {{ error }}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-secondary"
            data-bs-dismiss="modal"
          >
            Close
          </button>
          <button type="button" class="btn btn-primary" @click="addDiscount">
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from "bootstrap";

export default {
  name: "AddDiscountModal",
  props: {
    discountSchedules: {
      type: Array,
      default: () => ["10% - Seasonal", "15% - Loyalty", "20% - Bulk Order"],
    },
  },
  data() {
    return {
      selectedDiscount: "",
      error: null,
    };
  },
  methods: {
    addDiscount() {
      this.error = null;

      if (!this.selectedDiscount) {
        this.error = "Please select a discount schedule.";
        return;
      }

      // emit selected discount
      this.$emit("add-discount", this.selectedDiscount);

      // reset values
      this.selectedDiscount = "";
      this.error = null;

      // close modal
      const modalEl = document.getElementById("addDiscountModal");
      const modal = Modal.getInstance(modalEl);
      if (modal) modal.hide();
    },
  },
};
</script>