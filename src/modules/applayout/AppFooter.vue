<template>
  <footer
    class="footer bg-white shadow-sm d-flex justify-content-between align-items-center px-3 small"
    :class="{ collapsed: isCollapsed }"
  >
    <span>© 2025 LISCR LLC, ALL RIGHTS RESERVED | Privacy Policy</span>
    <span>
      Contact us :
      <a href="mailto:WPCloudSupport@liscr.com"> WPCloudSupport@liscr.com </a>
    </span>
  </footer>
</template>

<script>
export default {
  name: "AppFooter",
  props: {
    isCollapsed: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.footer {
  height: 40px;
  position: fixed;
  bottom: 0;
  left: 280px; /* expanded sidebar width */
  right: 0;
  transition: left 0.3s ease;
}

.footer.collapsed {
  left: 70px; /* collapsed sidebar width */
}
</style>
