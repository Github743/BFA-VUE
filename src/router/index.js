import { createRouter, createWebHistory } from "vue-router";
import CustomerLayout from "@/modules/customer/CustomerLayout.vue";
import WorkOrderSearch from "@/modules/workorder/WorkOrderSearch.vue";

const routes = [
   {
    path: "/agreements/issue",
    name: "IssueBlockFeeAgreement",
    component: CustomerLayout,
     meta: { title: "Issue Block Fee Agreement" },
    props: { nextLayout: "bfa" }
  },
  {
    path: "/agreements/ammend",
    name: "AmendBlockFeeAgreement",
    component: CustomerLayout,
     meta: { title: "Ammend Block Fee Agreement" },
    props: { nextLayout: "bfa" }
  },
  {
    path: "/agreements/terminate",
    name: "TerminateBlockFeeAgreement",
    component: CustomerLayout,
     meta: { title: "Terminate Block Fee Agreement" },
    props: { nextLayout: "bfa" }
  },
  {
  path: "/agreements/:step/:workOrderId",
  name: "BfaStepper",
  component: () => import("@/modules/bfa/pages/BfaLayout.vue"),
  props: true
},
  {
    path: "/workorders/search",
    name: "WorkOrderSearch",
    component: WorkOrderSearch,
    meta: { title: "Work Order Search" },
  }
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;