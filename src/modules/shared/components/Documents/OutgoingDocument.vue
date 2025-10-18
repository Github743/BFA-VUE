<template>
    <BaseTable :columns="columns" :rows="products"> </BaseTable>
</template>
<script>
    import BaseTable from "@/modules/shared/components/BaseTable.vue";
    export default {
        name: "OutgoingDocument",
        components: { BaseTable }
    }
</script>