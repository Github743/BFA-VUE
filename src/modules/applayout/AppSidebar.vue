<template>
  <aside
    class="sidebar bg-white shadow-sm d-flex flex-column"
    :class="{ collapsed: isCollapsed }"
  >
  <ul class="nav flex-column mt-3">
  <li>
    <RouterLink to="/workorders/search" class="nav-link d-flex align-items-center">
      <i class="bi bi-search me-2"></i>
      Work Order Search
    </RouterLink>
  </li>
</ul>
    <ul class="nav flex-column mt-3">
      <li>
        <!-- Toggle -->
        <a
          class="nav-link d-flex justify-content-between align-items-center"
          @click="toggleMenu('bfa')"
        >
          <span class="d-flex align-items-center">
            <img
              :src="require('@/assets/agrrement-icon.png')"
              alt="Agreement"
              width="18"
              height="18"
              class="me-2"
            />
            <span v-if="!isCollapsed">Block Fee Agreement (BFA)</span>
          </span>
          <i
            v-if="!isCollapsed"
            class="bi bi-chevron-down submenu-arrow"
            :class="{ rotated: openMenu === 'bfa' }"
          ></i>
        </a>

        <!-- Submenu -->
        <ul
          v-show="openMenu === 'bfa' && !isCollapsed"
          class="nav flex-column ms-4 submenu"
        >
          <li>
            <RouterLink to="/agreements/issue" class="nav-link">
              Issue Block Fee Agreement
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/agreements/ammend" class="nav-link">
              Amend Block Fee Agreement
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/agreements/terminate" class="nav-link">
              Terminate Block Fee Agreement
            </RouterLink>
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script>
export default {
  name: "SideBar",
  props: {
    isCollapsed: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      openMenu: null,
    };
  },
  methods: {
    toggleMenu(menu) {
      this.openMenu = this.openMenu === menu ? null : menu;
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 280px;
  min-height: 100vh;
  position: fixed;
  top: 60px; /* below topbar */
  bottom: 0;
  left: 0;
  transition: width 0.3s ease;
  overflow-x: hidden;
}

.sidebar.collapsed {
  width: 70px;
}

.nav-link {
  color: #333;
  padding: 0.75rem 1rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-link:hover,
.router-link-active {
  background-color: #00bcd4;
  color: #fff !important;
  border-radius: 0.375rem;
}

.submenu {
  transition: all 0.3s ease;
  overflow: hidden;
}

.submenu-arrow {
  transition: transform 0.3s ease;
}
.submenu-arrow.rotated {
  transform: rotate(180deg);
}
</style>
