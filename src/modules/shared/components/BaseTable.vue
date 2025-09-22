<template>
  <div class="table-responsive">
    <table class="table table-bordered table-striped align-middle">
      <thead class="table-light">
        <tr>
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
        <tr v-if="rows.length === 0">
          <td
            :colspan="visibleColumns.length + (showActions ? 1 : 0)"
            class="text-center text-muted"
          >
            No records found
          </td>
        </tr>

        <tr
          v-for="(row, rowIndex) in rows"
          :key="rowIndex"
          v-bind="rowDataAttributes(row)"
        >
          <!-- Render visible columns -->
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

          <!-- Actions cell -->
          <td v-if="showActions && !readonly" class="text-center">
            <slot name="cell-actions" :row="row" :rowIndex="rowIndex">
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary icon-btn me-2"
                  @click="onEdit(row, rowIndex)"
                  title="Edit"
                >
                  <i class="bi bi-pencil" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger icon-btn"
                  @click="onDelete(row, rowIndex)"
                  title="Delete"
                >
                  <i class="bi bi-trash" aria-hidden="true"></i>
                </button>
              </div>
            </slot>
          </td>
          https://github.com/Github743/BFA-VUE

          <!-- Optionally render hidden columns -->
          <td
            v-for="(col, i) in hiddenButPresentColumns"
            :key="'hidden-' + i"
            class="d-none"
            aria-hidden="true"
          >
            {{ row[col.field] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
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
  },
  computed: {
    visibleColumns() {
      return this.columns.filter((c) => !c.hidden);
    },
    hiddenColumns() {
      return this.columns.filter((c) => c.hidden);
    },
    hiddenButPresentColumns() {
      return this.keepHiddenInDom ? this.hiddenColumns : [];
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
      if (!value) return "";

      // if column is marked as date
      if (col.type === "date") {
        const date = new Date(value);
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
      const payload = this.idAccessor
        ? this.idAccessor(row)
        : { row, rowIndex };
      this.$emit("delete", payload);
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
