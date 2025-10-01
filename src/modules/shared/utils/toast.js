import { Toast } from "bootstrap";

const toastIcons = {
  success: `<i class="bi bi-check-circle-fill me-2"></i>`,
  warning: `<i class="bi bi-exclamation-triangle-fill me-2"></i>`,
  danger: `<i class="bi bi-x-circle-fill me-2"></i>`,
  info: `<i class="bi bi-info-circle-fill me-2"></i>`,
};

export function showToast(
  message,
  type = "danger",
  title = "",
  showProgress = true,
  delay = 4000
) {
  const icon = toastIcons[type] || "";
  const heading = title || type.charAt(0).toUpperCase() + type.slice(1);

  // Pick progress bar color same as toast type
  const progressColors = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
  };
  const progressColor = progressColors[type] || "bg-light";

  // Create toast element
  const toastEl = document.createElement("div");
  toastEl.className = `toast text-bg-${type} border-0 shadow overflow-hidden mb-2`;
  toastEl.role = "alert";
  toastEl.ariaLive = "assertive";
  toastEl.ariaAtomic = "true";

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <strong>${icon}${heading}</strong>
        <div>${message}</div>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    ${
      showProgress
        ? `
      <div class="progress" style="height: 4px;">
        <div class="progress-bar ${progressColor}" role="progressbar"></div>
      </div>`
        : ""
    }
  `;

  // Append to container
  const container =
    document.getElementById("toast-container") || createToastContainer();
  container.appendChild(toastEl);

  // Initialize and show toast
  const bsToast = new Toast(toastEl, { delay });
  bsToast.show();

  // Animate progress bar if enabled
  if (showProgress) {
    const bar = toastEl.querySelector(".progress-bar");
    if (bar) {
      // Start full width, shrink to 0
      bar.style.width = "100%";
      setTimeout(() => {
        bar.style.transition = `width ${delay}ms linear`;
        bar.style.width = "0%";
      }, 100); // allow DOM paint
    }
  }

  // Remove from DOM when hidden
  toastEl.addEventListener("hidden.bs.toast", () => {
    toastEl.remove();
  });
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toast-container";
  container.className = "toast-container position-fixed top-0 end-0 p-3";
  document.body.appendChild(container);
  return container;
}
