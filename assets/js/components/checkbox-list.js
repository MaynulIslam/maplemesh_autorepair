class CheckboxList extends BaseComponent {
  get defaultOptions() {
    return {
      items: [],
      disabled: false,
      showAddButton: false,
      addButtonText: "Add More",
      addButtonClass: "btn btn-sm btn-primary mt-2",
    };
  }

  render() {
    const checkboxes = this.options.items
      .map(
        (item, index) => `
            <div class="form-check mb-2">
                <input
                    class="form-check-input"
                    type="checkbox"
                    ${item.checked ? "checked" : ""}
                    ${this.options.disabled ? "disabled" : ""}
                    id="${item.id || `checkbox-${index}`}"
                />
                <label class="form-check-label" for="${
                  item.id || `checkbox-${index}`
                }">
                    ${item.label}
                </label>
            </div>
        `
      )
      .join("");

    const addButton = this.options.showAddButton
      ? `<button class="${this.options.addButtonClass}" data-action="add">${this.options.addButtonText}</button>`
      : "";

    this.element.innerHTML = `${checkboxes}${addButton}`;
  }

  bindEvents() {
    const addBtn = this.element.querySelector('[data-action="add"]');
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        this.handleAdd();
      });
    }
  }

  handleAdd() {
    if (this.options.onAdd) {
      this.options.onAdd();
    }
  }
}

window.CheckboxList = CheckboxList;
