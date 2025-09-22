import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "@/App.vue";
import router from "@/router";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import BootstrapVueNext from "bootstrap-vue-next";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

import "bootstrap-icons/font/bootstrap-icons.css";

import "flatpickr/dist/flatpickr.css";

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(BootstrapVueNext);

app.mount("#app");
