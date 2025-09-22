// src/utils/toast.js
import { Toast } from "bootstrap";

export function showToast(message, type = "danger") {
  // Create toast element
  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  toastEl.role = "alert";
  toastEl.ariaLive = "assertive";
  toastEl.ariaAtomic = "true";

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  // Append to container
  const container = document.getElementById("toast-container");
  container.appendChild(toastEl);

  // Initialize and show toast
  const bsToast = new Toast(toastEl, { delay: 4000 });
  bsToast.show();

  // Remove from DOM when hidden
  toastEl.addEventListener("hidden.bs.toast", () => {
    toastEl.remove();
  });
}
