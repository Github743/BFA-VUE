<!-- <template>
  <div class="app-layout">
    <Topbar />

    <div class="main-body">
      <Sidebar :is-collapsed="isCollapsed" @toggle="toggleSidebar" />
      <main class="content" :class="{ collapsed: isCollapsed }">
        <div class="content-inner">
          <RouterView />
        </div>
      </main>
    </div>

    <AppFooter />
  </div>
</template> -->

<template>
  <div class="app-layout d-flex flex-column">
    <Topbar @toggleSidebar="toggleSidebar" />

    <div class="d-flex flex-grow-1">
      <Sidebar :is-collapsed="isCollapsed" />
      <main class="content flex-grow-1" :class="{ collapsed: isCollapsed }">
        <div class="content-inner">
          <RouterView />
        </div>
      </main>
    </div>

    <AppFooter :is-collapsed="isCollapsed" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import Topbar from "@/modules/applayout/AppTopbar.vue";
import Sidebar from "@/modules/applayout/AppSidebar.vue";
import AppFooter from "@/modules/applayout/AppFooter.vue";

const isCollapsed = ref(false);
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-body {
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  margin-top: 60px;
  margin-left: 280px;
  padding: 20px;
  background-color: #f8f9fa;
  overflow-y: auto;
}

.content.collapsed {
  margin-left: 70px;
}

.content-inner {
  padding: 1rem;
}
</style>
