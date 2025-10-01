<template>
  <header
    class="topbar bg-white shadow-sm d-flex justify-content-between align-items-center px-3"
  >
    <div class="d-flex align-items-center">
      <a :href="routerBase">
        <img
          :src="require('@/assets/liscr_logo.png')"
          alt="Logo"
          style="max-height: 40px"
        />
      </a>
    </div>
    <div>
      <i class="bi bi-bell me-3"></i>
      <i class="bi bi-person-circle"></i>
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
}
</style>
