<template>
  <div class="d-flex flex-column align-items-center justify-content-center" >
    <h4 class="text-danger fw-bold mb-3">{{ $route.meta.title }}</h4>
    <h5 class="text-primary mb-4">Search for a Client Name or Number below.</h5>

    <div
      ref="root"
      class="client-search position-relative w-100"
      style="max-width: 500px"
    >
      <!-- Search Bar -->
      <div class="input-group">
        <input
          type="text"
          v-model="searchQuery"
          class="form-control"
          placeholder="Enter Minimum 3 Characters To Search."
          @input="onInput"
        />

        <button class="btn btn-success" type="button" @click="triggerSearch">
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          <i v-else class="bi bi-search"></i>
        </button>
      </div>

      <!-- Dropdown -->
      <ul
  v-if="showDropdown && searchQuery.length >= 3"
  class="list-group position-absolute w-100 mt-1 dropdown-list"
>
  <template v-if="clients && clients.length > 0">
    <li
      v-for="client in clients"
      :key="client.clientId"
      class="list-group-item list-group-item-action"
      @click="selectClient(client)"
    >
      <strong>{{ client.clientNumber }}</strong> - {{ client.clientName }}
    </li>
  </template>

  <template v-else>
    <li class="list-group-item text-muted text-center">
      No results found
    </li>
  </template>
</ul>

    </div>
  </div>
</template>

<script>

export default {
  name: "ClientSearchAutocomplete",
  props: {
    clients: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["start", "search", "select"],
  data() {
    return {
      searchQuery: "",
      selectedClient: null,
      showDropdown: false,
      timer: null,
    };
  },
  methods: {
    onInput() {
      this.selectedClient = null;
      this.showDropdown = true;

      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if (this.searchQuery && this.searchQuery.length >= 3) {
          this.$emit("search", this.searchQuery);
        }
      }, 300);
    },

    triggerSearch() {
      if (this.searchQuery && this.searchQuery.length >= 3) {
        this.$emit("search", this.searchQuery);
        this.showDropdown = true;
      }
    },

    selectClient(client) {
      this.searchQuery = `${client.clientNumber} - ${client.clientName}`;
      this.selectedClient = client;
      this.showDropdown = false;
      this.$emit("select", client);
    },

    startSearch() {
      if (this.selectedClient) {
        this.$emit("start", this.selectedClient);
      }
    },

    onClickOutside(e) {
      if (!this.$refs.root.contains(e.target)) {
        this.showDropdown = false;
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.onClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.onClickOutside);
    if (this.timer) clearTimeout(this.timer);
  },
};
</script>

<style scoped>
.client-search {
  position: relative;
  max-width: 500px;
}
.list-group-item.text-muted.text-center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 48px;
}
.dropdown-list {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  background: #fff;
}
</style>