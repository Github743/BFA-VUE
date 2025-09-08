<template>
  <div class="table-responsive">
    <table class="table table-bordered table-striped align-middle">
      <thead class="table-light">
        <tr>
          <th
            v-for="(col, index) in columns"
            :key="index"
            :style="{ width: col.width || 'auto' }"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length" class="text-center text-muted">
            No records found
          </td>
        </tr>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td v-for="(col, colIndex) in columns" :key="colIndex">
            <slot :name="col.field" :row="row">
              {{ row[col.field] }}
            </slot>
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
    columns: {
      type: Array,
      required: true,
    },
    rows: {
      type: Array,
      required: true,
    },
  },
};
</script>
