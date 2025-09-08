import { createRouter, createWebHistory } from "vue-router";
import CustomerLayout from "@/modules/customer/CustomerLayout.vue";
import BfaLayout from "@/modules/bfa/pages/BfaLayout.vue"
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
    path: "/agreements/bfa/:clientId",
    name: "BfaLayout",
    component: BfaLayout,
    props: true
  },
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;