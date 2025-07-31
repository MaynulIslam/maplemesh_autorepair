class DataTable extends BaseComponent {
  get defaultOptions() {
    return {
      headers: [],
      data: [],
      tableClass: "table table-hover align-middle mb-0",
      headerClass: "",
      showActions: false,
      actionButtons: [],
    };
  }

  render() {
    const headers = this.options.headers
      .map((header) => `<th>${header}</th>`)
      .join("");

    const rows = this.options.data
      .map((row, index) => {
        const cells = row.map((cell) => `<td>${cell}</td>`).join("");
        const actions = this.options.showActions
          ? this.renderActionButtons(index)
          : "";
        return `<tr>${cells}${actions}</tr>`;
      })
      .join("");

    this.element.innerHTML = `
            <div class="table-responsive">
                <table class="${this.options.tableClass}">
                    <thead class="${this.options.headerClass}">
                        <tr>
                            ${headers}
                            ${
                              this.options.showActions ? "<th>ACTIONS</th>" : ""
                            }
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
  }

  renderActionButtons(rowIndex) {
    const buttons = this.options.actionButtons
      .map(
        (button) => `
            <button class="btn ${button.class} btn-sm" data-action="${
          button.action
        }" data-row="${rowIndex}">
                ${button.icon ? `<i class="${button.icon} me-1"></i>` : ""}${
          button.text
        }
            </button>`
      )
      .join("");

    return `<td><div class="btn-group">${buttons}</div></td>`;
  }

  bindEvents() {
    this.element.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      const rowIndex = e.target.dataset.row;

      if (action && this.options.onAction) {
        this.options.onAction(
          action,
          parseInt(rowIndex),
          this.options.data[rowIndex]
        );
      }
    });
  }
}

window.DataTable = DataTable;
