import { Modal } from "bootstrap";

/**
 * Shows a reusable Bootstrap confirm dialog.
 * @param {Object} opts
 * @param {string} opts.title - dialog title
 * @param {string} opts.message - dialog message (can be HTML)
 * @param {string} opts.confirmText - confirm button text
 * @param {string} opts.cancelText - cancel button text
 * @param {string} opts.confirmClass - bootstrap btn class for confirm (e.g. 'btn-danger' or 'btn-primary')
 * @returns {Promise<boolean>} resolves true when confirmed, false otherwise
 */
export default function confirmDialog({
  title = "Please confirm",
  message = "Are you sure?",
  confirmText = "Yes",
  cancelText = "Cancel",
  confirmClass = "btn-danger",
} = {}) {
  return new Promise((resolve) => {
    let resolved = false;

    const container = document.createElement("div");
    container.className = "modal fade";
    container.tabIndex = -1;
    container.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div>${message}</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelText}</button>
            <button type="button" class="btn ${confirmClass}" id="__confirmBtn">${confirmText}</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    const bsModal = new Modal(container, {
      backdrop: "static",
      keyboard: true,
    });

    const cleanup = (result) => {
      if (resolved) return;
      resolved = true;
      try {
        bsModal.hide();
      } catch (e) {
        console.log(e);
      }
      resolve(result);
    };

    const confirmBtn = container.querySelector("#__confirmBtn");
    const onConfirm = () => cleanup(true);
    confirmBtn.addEventListener("click", onConfirm);

    const onHidden = () => {
      confirmBtn.removeEventListener("click", onConfirm);
      container.removeEventListener("hidden.bs.modal", onHidden);

      try {
        bsModal.dispose();
      } catch (e) {
        console.log(e);
      }

      if (container.parentNode) container.parentNode.removeChild(container);

      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    };

    container.addEventListener("hidden.bs.modal", onHidden);

    bsModal.show();
  });
}
