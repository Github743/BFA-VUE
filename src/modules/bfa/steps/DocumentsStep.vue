<template>
    <h4>Notes</h4>
    <BaseTable :columns="columns"
               :rows="notes"
               :readonly="readOnly"
               :show-actions="true"
               :actions-width="'120px'"
               @edit="onEdit"
               @delete="onDelete"
               :enableBulkDelete="true"
               :idAccessor="(row) => row.entityNoteId"
               @selection-change="onSelectionChange"
               @bulk-delete="deleteSchedules">
    </BaseTable>
</template>
<script>
import BaseTable from "@/modules/shared/components/BaseTable.vue";
import DocumentService from "@/modules/shared/services/Documents.js";

export default{
  name: "DocumentsStep",
  components: { BaseTable},
  data() {
   return {
   notes:[],

    columns: [
   {
     label: "entityNoteId",
     field: "entityNoteId",
     hidden: true,
   },
   { label: "Notes", field: "text" },
   { label: "Create Date", field: "creationDate" },
   { label: "Created By", field: "createdBy", width: "15%" },
 ],
   }},

   methods:{
    async loadNotes(workOrderId) {
  if (!workOrderId) return;
  try {
    const lnotes = await DocumentService.getNotes(
      (workOrderId)
    );
    const list = Array.isArray(lnotes)
      ? lnotes
      : lnotes?.items ?? lnotes?.data ?? [];
    this.notes = (list || []).map((e) => ({
      ...e,
      text: e.text,
      creationDate: e.creationDate,
      createdBy: e.createdBy,
    }));
    this.total = this.notes.length;
    this.$emit("update:products", [...this.notes]);
  } catch (err) {
    console.error("Failed to load notes:", err);
  } 
},
   }
}
</script>