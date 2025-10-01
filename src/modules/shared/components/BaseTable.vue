<template>
  <div class="table-responsive">
    <!-- bulk delete button row -->
    <div v-if="enableBulkDelete && selectedCount >= minBulkCount" class="mb-2">
      <button
        class="btn btn-danger btn-sm"
        @click="onBulkDelete"
        :disabled="deleting"
      >
        <span
          v-if="deleting"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
        {{ bulkDeleteLabel }} ({{ selectedCount }})
      </button>
    </div>

    <table class="table table-bordered table-striped align-middle">
      <thead class="table-light">
        <tr>
          <!-- checkbox column -->
          <th
            v-if="enableBulkDelete && !readonly"
            style="width: 40px; text-align: center"
          >
            <input
              type="checkbox"
              :checked="allSelected"
              @change="toggleSelectAll($event.target.checked)"
              aria-label="Select all rows"
            />
          </th>

          <th
            v-for="(col, index) in visibleColumns"
            :key="index"
            :style="{ width: col.width || 'auto' }"
          >
            {{ col.label }}
          </th>

          <th
            v-if="showActions && !readonly"
            :style="{ width: actionsWidth }"
            class="text-center"
          >
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-if="!rows || rows.length === 0">
          <td
            :colspan="
              (visibleColumns ? visibleColumns.length : 0) +
              (showActions ? 1 : 0) +
              (enableBulkDelete ? 1 : 0)
            "
            class="text-center text-muted"
          >
            No records found
          </td>
        </tr>

        <tr
          v-for="(row, rowIndex) in rows"
          :key="getRowKey(row, rowIndex)"
          v-bind="rowDataAttributes(row)"
        >
          <!-- row checkbox -->
          <td v-if="enableBulkDelete && !readonly" class="text-center">
            <input
              type="checkbox"
              :value="getRowId(row, rowIndex)"
              v-model="selectedIds"
              aria-label="Select row"
            />
          </td>

          <!-- normal columns -->
          <td
            v-for="(col, colIndex) in visibleColumns"
            :key="colIndex"
            :class="col.tdClass"
          >
            <slot
              :name="`cell-${col.field}`"
              :row="row"
              :value="row[col.field]"
            >
              {{ formatValue(row[col.field], col) }}
            </slot>
          </td>

          <!-- actions -->
          <td v-if="showActions && !readonly" class="text-center">
            <slot name="cell-actions" :row="row" :rowIndex="rowIndex">
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary icon-btn me-2"
                  @click="onEdit(row, rowIndex)"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger icon-btn"
                  @click="onDelete(row, rowIndex)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import confirmDialog from "@/modules/shared/utils/confirm.js";

export default {
  name: "BaseTable",
  props: {
    columns: { type: Array, required: true },
    rows: { type: Array, required: true },
    keepHiddenInDom: { type: Boolean, default: false },
    exposeHiddenAsDataAttributes: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    showActions: { type: Boolean, default: true },
    actionsWidth: { type: String, default: "100px" },
    idAccessor: { type: Function, default: null },

    // bulk options
    enableBulkDelete: { type: Boolean, default: false },
    minBulkCount: { type: Number, default: 1 }, // show bulk button only when >= 2 selected
    bulkDeleteLabel: { type: String, default: "Delete Selected" },
  },

  data() {
    return {
      // initialize selectedIds so computed/readers don't blow up
      selectedIds: [],
      deleting: false,
    };
  },

  computed: {
    // defensive: selectedIds should always be an array, but guard anyway
    selectedCount() {
      return Array.isArray(this.selectedIds) ? this.selectedIds.length : 0;
    },

    visibleColumns() {
      return Array.isArray(this.columns)
        ? this.columns.filter((c) => !c.hidden)
        : [];
    },

    hiddenColumns() {
      return Array.isArray(this.columns)
        ? this.columns.filter((c) => c.hidden)
        : [];
    },

    hiddenButPresentColumns() {
      return this.keepHiddenInDom ? this.hiddenColumns : [];
    },

    allSelected() {
      if (!Array.isArray(this.rows) || this.rows.length === 0) return false;
      const allIds = this.rows.map((r, i) => String(this.getRowId(r, i)));
      return allIds.every((id) => this.selectedIds.map(String).includes(id));
    },
  },

  methods: {
    rowDataAttributes(row) {
      if (!this.exposeHiddenAsDataAttributes) return {};
      const attrs = {};
      for (const col of this.hiddenColumns) {
        const field = col.field;
        const val = row[field];
        const name = `data-${String(field)
          .replace(/[^a-z0-9-_]/gi, "-")
          .toLowerCase()}`;
        attrs[name] = val == null ? "" : String(val);
      }
      return attrs;
    },

    formatValue(value, col) {
      if (value == null || value === "") return "";

      // if column is marked as date
      if (col && col.type === "date") {
        const date = new Date(value);
        if (isNaN(date)) return value;
        return date
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .replace(/ /g, "-"); // 19-Sep-2025
      }

      return value;
    },

    onEdit(row, rowIndex) {
      const payload = this.idAccessor
        ? this.idAccessor(row)
        : { row, rowIndex };
      this.$emit("edit", payload);
    },

    onDelete(row, rowIndex) {
      const id = this.getRowId(row, rowIndex);
      const payload = { id, row, rowIndex };
      this.$emit("delete", payload);
    },

    // canonical id getter: always return a string
    getRowId(row, rowIndex) {
      const id = this.idAccessor
        ? this.idAccessor(row)
        : row?.id ?? row?.Id ?? rowIndex;
      return String(id);
    },

    // stable key for v-for: prefer an id if present else fallback to rowIndex
    getRowKey(row, rowIndex) {
      const maybe = this.idAccessor
        ? this.idAccessor(row)
        : row?.id ?? rowIndex;
      return maybe != null ? maybe : rowIndex;
    },

    toggleSelectAll(checked) {
      if (!checked) {
        this.selectedIds = [];
        return;
      }
      // select all visible rows (current page)
      this.selectedIds = (this.rows || []).map((r, i) => this.getRowId(r, i));
    },

    async onBulkDelete() {
      if (!this.selectedIds || this.selectedIds.length === 0) return;

      // keep a copy of ids so we don’t lose them
      const idsToDelete = [...this.selectedIds];

      // 🔹 use your reusable confirm dialog instead of window.confirm
      const ok = await confirmDialog({
        title: "Confirm Delete",
        message: `Delete <strong>${idsToDelete.length}</strong> items? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        confirmClass: "btn-danger",
      });

      if (!ok) return;

      this.deleting = true;
      try {
        // emit to parent to handle API call
        this.$emit("bulk-delete", idsToDelete);

        // reset selection only after emit
        this.selectedIds = [];
      } catch (err) {
        console.error("Bulk delete failed", err);
      } finally {
        this.deleting = false;
      }
    },
  },
};
</script>

<style scoped>
.d-none {
  display: none !important;
}

.icon-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
