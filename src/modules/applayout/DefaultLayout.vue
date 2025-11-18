<template>
  <div class="app-layout d-flex flex-column">
    <Topbar @toggleSidebar="toggleSidebar" />

    <div class="d-flex flex-grow-1">
      <!-- <Sidebar :is-collapsed="isCollapsed" /> --> 
       <Sidebar v-if="showSidebar" :is-collapsed="isCollapsed" />

      <!-- <main class="content flex-grow-1" :class="{ collapsed: isCollapsed }"> -->
    <main
        class="content flex-grow-1"
        :class="{ collapsed: isCollapsed && showSidebar }"
        :style="contentStyle"
      >
        <div class="content-inner">
          <RouterView :key="$route.fullPath" />
        </div>
      </main>
    </div>

    <AppFooter :is-collapsed="isCollapsed" />

    <div
      class="toast-container position-fixed top-0 end-0 p-3"
      id="toast-container"
      aria-live="polite"
      aria-atomic="true"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed} from "vue";
import Topbar from "@/modules/applayout/AppTopbar.vue";
import Sidebar from "@/modules/applayout/AppSidebar.vue";
import AppFooter from "@/modules/applayout/AppFooter.vue";
import { useRoute } from "vue-router";

const isCollapsed = ref(false);
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
const route = useRoute();
// Show sidebar for all routes that start with /agreements (adjust as needed)
const showSidebar = computed(() => 
  route.path.startsWith("/bfa") || route.path.startsWith("/agreements")
);

// compute left margin depending on whether the sidebar is shown and collapsed
const contentStyle = computed(() => {
  if (!showSidebar.value) {
    return {
      marginLeft: "0px",
      transition: "margin-left 200ms ease"
    };
  }
  // sidebar is shown
  return {
    marginLeft: isCollapsed.value ? "70px" : "280px",
    transition: "margin-left 200ms ease"
  };
});
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

/* .content.collapsed {
  margin-left: 70px;
} */

.content-inner {
  padding: 1rem;
  margin-top: -4%;
}
</style>
