class DashboardCard extends BaseComponent {
  get defaultOptions() {
    return {
      title: "",
      headerClass: "",
      showEditButton: false,
      content: "",
      actions: [],
      cardType: "default", // default, table, stats
    };
  }

  render() {
    const editButton = this.options.showEditButton
      ? `<button class="btn btn-outline-primary btn-sm" data-action="edit">Edit</button>`
      : "";

    if (this.options.cardType === "table") {
      this.renderTableCard(editButton);
    } else if (this.options.cardType === "stats") {
      this.renderStatsCard();
    } else {
      this.renderDefaultCard(editButton);
    }
  }

  renderDefaultCard(editButton) {
    this.element.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="text-primary mb-0">${this.options.title}</h6>
                    ${editButton}
                </div>
                ${this.options.content}
            </div>
        `;
  }

  renderTableCard(editButton) {
    this.element.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${this.options.title}</h5>
                ${editButton}
            </div>
            <div class="card-body p-0">
                ${this.options.content}
            </div>
        `;
  }

  renderStatsCard() {
    this.element.innerHTML = `
            <div class="card-body">
                <h6 class="text-primary mb-3">${this.options.title}</h6>
                ${this.options.content}
            </div>
        `;
  }

  bindEvents() {
    const editBtn = this.element.querySelector('[data-action="edit"]');
    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleEdit();
      });
    }
  }

  handleEdit() {
    if (this.options.onEdit) {
      this.options.onEdit();
    }
  }
}

window.DashboardCard = DashboardCard;
