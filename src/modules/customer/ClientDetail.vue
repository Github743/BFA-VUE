<template>
  <div class="client-details">
    <h5 class="text-primary mb-3">Client Details</h5>
    <hr />
    <div class="client-details-row">
      <div class="field field-name">
        <div class="label">Client Name</div>
        <div class="value">
            {{ client.clientName }}
        </div>
      </div>

      <div class="field field-number">
        <div class="label">Client Number</div>
        <div class="value">{{ client.clientNumber }}</div>
      </div>

      <div class="field field-status">
        <div class="label">Status</div>
        <div class="value">{{ client.status || "—" }}</div>
      </div>

      <div class="field field-city">
        <div class="label">City</div>
        <div class="value">{{ client.city || "—" }}</div>
      </div>

      <div class="field field-country">
        <div class="label">Country</div>
        <div class="value">{{ client.country || "—" }}</div>
      </div>

      <div class="field field-roles" title="Client Roles">
        <div class="label">Client Roles</div>
        <div class="value roles">
          {{ (client.clientRoles && client.clientRoles.length) ? client.clientRoles: "No roles" }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    client: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.client-details {
  padding: 0.25rem 0.5rem;
}

.client-details-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 2rem;
  align-items: flex-start;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.field .label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
  white-space: nowrap;
}

.field .value {
  font-size: 1rem;
  font-weight: 500;
}

.field-name { min-width: 220px; max-width: 320px; }  
.field-number { min-width: 110px; max-width: 140px; text-align: left; }
.field-status { min-width: 90px; max-width: 120px; text-align: left; }
.field-city { min-width: 100px; max-width: 140px; text-align: left; }
.field-country { min-width: 100px; max-width: 140px; text-align: left; }

.field-roles {
  flex: 1 1 400px; 
  min-width: 200px;
  max-width: none;
}
.field-roles .value.roles {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  font-weight: 600;
  color: #374151;
}

.client-details-row::-webkit-scrollbar {
  height: 8px;
}
.client-details-row::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.08);
  border-radius: 6px;
}

@media (max-width: 640px) {
  .field-name { min-width: 180px; }
  .field-roles { min-width: 160px; }
}
</style>
