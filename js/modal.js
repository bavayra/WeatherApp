class Modal {
  constructor() {
    this.modals = new Map();
    this.activeModal = null;
    this.previousFocus = null;
    this.handleEscape = this.handleEscape.bind(this);

    document.addEventListener("keydown", this.handleEscape);
  }

  createModal(type) {
    if (this.modals.has(type)) {
      return this.modals.get(type);
    }

    const modal = document.createElement("div");
    modal.id = `${type}-modal`;
    modal.className = "modal";

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-describedby", `${type}-modal-desc`);
    if (type === "error") {
      modal.innerHTML = `
        <div class="modal-content">
          <button class="modal-close" aria-label="Close modal">&times;</button>
          <div class="modal-icon error-icon" aria-hidden="true"></div>
          <h2 class="modal-title visually-hidden">Error</h2>
          <p class="modal-message" id="${type}-modal-desc"></p>
          <button class="modal-ok-btn" autofocus>OK</button>
        </div>
      `;
    } else if (type === "confirm") {
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-icon confirm-icon" aria-hidden="true"></div>
          <h2 class="modal-title visually-hidden">Confirmation</h2>
          <p class="modal-message" id="${type}-modal-desc"></p>
          <div class="modal-buttons">
            <button class="modal-confirm-btn" autofocus>Yes</button>
            <button class="modal-cancel-btn">Cancel</button>
          </div>
        </div>
      `;
    }

    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.hide(type);
      }
    });

    this.modals.set(type, modal);
    return modal;
  }

  showError(message) {
    const modal = this.createModal("error");
    const messageEl = modal.querySelector(".modal-message");
    messageEl.textContent = message;

    const closeBtn = modal.querySelector(".modal-close");
    const okBtn = modal.querySelector(".modal-ok-btn");

    const newCloseBtn = closeBtn.cloneNode(true);
    const newOkBtn = okBtn.cloneNode(true);

    closeBtn.replaceWith(newCloseBtn);
    okBtn.replaceWith(newOkBtn);

    newCloseBtn.addEventListener("click", () => this.hide("error"));
    newOkBtn.addEventListener("click", () => this.hide("error"));

    this.show("error", modal);
  }

  showConfirm(message, onConfirm, onCancel) {
    const modal = this.createModal("confirm");
    const messageEl = modal.querySelector(".modal-message");
    messageEl.textContent = message;

    const confirmBtn = modal.querySelector(".modal-confirm-btn");
    const cancelBtn = modal.querySelector(".modal-cancel-btn");

    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);

    confirmBtn.replaceWith(newConfirmBtn);
    cancelBtn.replaceWith(newCancelBtn);

    newConfirmBtn.addEventListener("click", () => {
      this.hide("confirm");
      if (onConfirm) onConfirm();
    });

    newCancelBtn.addEventListener("click", () => {
      this.hide("confirm");
      if (onCancel) onCancel();
    });
    this.show("confirm", modal);
  }

  show(type, modal) {
    this.previousFocus = document.activeElement;
    this.activeModal = type;
    modal.classList.add("show");

    setTimeout(() => {
      const firstFocusable = modal.querySelector("[autofocus], button");
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }, 100);

    document.body.style.overflow = "hidden";
  }
  hide(type) {
    const modal = this.modals.get(type);
    if (!modal) return;

    modal.classList.remove("show");
    this.activeModal = null;

    if (this.previousFocus) {
      this.previousFocus.focus();
      this.previousFocus = null;
    }

    document.body.style.overflow = "";

    if (type === "error") {
      this.clearSearchResults();
    }
  }

  handleEscape(e) {
    if (e.key === "Escape" && this.activeModal) {
      this.hide(this.activeModal);
    }
  }

  clearSearchResults() {
    const searchResults = document.getElementById("search-results");
    if (searchResults) {
      searchResults.remove();
    }

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.value = "";
    }

    const event = new CustomEvent("clearSearch");
    document.dispatchEvent(event);
  }

  destroy() {
    this.modals.forEach((modal) => modal.remove());
    this.modals.clear();
    document.removeEventListener("keydown", this.handleEscape);
  }
}

const modalManager = new Modal();

export function showErrorModal(message) {
  modalManager.showError(message);
}

export function showConfirmModal(message, onConfirm, onCancel) {
  modalManager.showConfirm(message, onConfirm, onCancel);
}

export function hideErrorModal() {
  modalManager.hide("error");
}

export function hideConfirmModal() {
  modalManager.hide("confirm");
}

export default modalManager;
