<template>
  <div class="app-layout d-flex flex-column">
    <Topbar @toggleSidebar="toggleSidebar" />

    <div class="d-flex flex-grow-1">
      <!-- <Sidebar :is-collapsed="isCollapsed" /> --> 
       <Sidebar v-if="showSidebar" :is-collapsed="isCollapsed" />

      <!-- <main class="content flex-grow-1" :class="{ collapsed: isCollapsed }"> -->
    <main 
        :class="{
          content: showSidebar,   /* apply only when true */
          'flex-grow-1': true,
          'mt-90': !showSidebar
              /* always applied */
        }"  
      
      >
        <div class="content-inner">
          <RouterView :key="$route.fullPath" />
        </div>
      </main>
    </div>

    <AppFooter  />

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

.mt-90 {
  margin-top: 90px;
}
</style>
