<template>
  <div class="d-flex flex-column align-items-center justify-content-center">
    <h4 class="text-danger fw-bold mb-3">{{ $route.meta.title }}</h4>
    <h5 class="text-primary mb-4">Search for a Client Name or Number below.</h5>
    <div class="client-search position-relative w-100" style="max-width: 500px">
      <div class="input-group">
        <input
          type="text"
          v-model="searchQuery"
          class="form-control"
          placeholder="Enter Minimum 3 Characters To Search."
          @input="onInput"
        />
        <button class="btn btn-success">
          <i class="bi bi-search"></i>
        </button>
      </div>
      <ul
        v-if="showDropdown && searchQuery.length >= 3"
        class="list-group position-absolute w-100 mt-1"
        style="z-index: 1000"
      >
        <template v-if="filteredClients.length > 0">
          <li
            v-for="client in filteredClients"
            :key="client.id"
            class="list-group-item list-group-item-action"
            @click="selectClient(client)"
          >
            <strong>{{ client.id }}</strong
            >, {{ client.name }}
          </li>
        </template>
        <template v-else>
          <li class="list-group-item text-muted text-center">
            No results found
          </li>
        </template>
      </ul>
    </div>
    <div
      class="d-flex justify-content-end mt-3"
      style="max-width: 500px; width: 100%"
    >
      <button
        class="btn btn-primary"
        :disabled="!selectedClient"
        @click="startSearch"
      >
        Start
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ClientSearchAutocomplete",
  props: {
    clients: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      searchQuery: "",
      selectedClient: null,
      showDropdown: false,
    };
  },
  computed: {
    filteredClients() {
      if (this.searchQuery.length < 3) return [];
      return this.clients.filter(
        (c) =>
          c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          c.id.toString().includes(this.searchQuery)
      );
    },
  },
  methods: {
    onInput() {
      this.selectedClient = null;
      this.showDropdown = true;
    },
    selectClient(client) {
      this.searchQuery = `${client.id}, ${client.name}`;
      this.selectedClient = client;
      this.showDropdown = false;
    },
    startSearch() {
      if (this.selectedClient) {
        this.$emit("start", this.selectedClient);
      }
    },
  },
};
</script>

<style scoped>
.client-search {
  position: relative;
  max-width: 500px;
}
.zindex-dropdown {
  z-index: 1050;
}
</style>
