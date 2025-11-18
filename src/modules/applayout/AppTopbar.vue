<template>
  <header
    class="topbar bg-white shadow-sm d-flex align-items-center"
  >  
    <!-- Logo Section -->
    <div class="d-flex align-items-center ps-3">
      <a :href="routerBase">
        <img
          :src="require('@/assets/liscr_logo.png')"
          alt="Logo"
          style="max-height: 40px"
        />
      </a>
    </div>
    <!-- Navigation Menu -->
    <nav class="d-flex align-items-center gap-4 ms-5">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
      <router-link to="/agreements" class="nav-link">BFA</router-link>
      <router-link to="/annual-billing" class="nav-link">Annual Billing</router-link>
    </nav>

    <!-- User Actions Section -->
    <div class="d-flex align-items-center gap-3 ms-auto pe-3">
      <i class="bi bi-bell" style="cursor: pointer; font-size: 1.2rem;"></i>
      <div class="d-flex align-items-center gap-2">
        <span class="user-name">Fazeel Ahmed</span>
        <i class="bi bi-person-circle" style="cursor: pointer; font-size: 1.5rem;"></i>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "TopBar",
  computed: {
    routerBase() {
      return process.env.BASE_URL;
    },
  },
};
</script>

<style scoped>
.topbar {
  height: 60px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1030;
   width: 100%;

}

.nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover {
  color: #0066cc;
}

.user-name {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.gap-3 {
  gap: 1rem;
}

.gap-4 {
  gap: 1.5rem;
}

/* Active Link Styling */
.router-link-active {
  color: #0066cc !important;
  font-weight: 600;
}
</style>