class JobListing extends BaseComponent {
  get defaultOptions() {
    return {
      jobs: [],
      currentIndex: 0,
      showActions: true,
      showPagination: true,
    };
  }

  render() {
    if (!this.options.jobs || this.options.jobs.length === 0) {
      this.renderEmpty();
      return;
    }

    const job = this.options.jobs[this.options.currentIndex];
    const actions = this.options.showActions ? this.renderActions() : "";
    const pagination = this.options.showPagination
      ? this.renderPagination()
      : "";

    this.element.innerHTML = `
            <div class="job-details mb-3">
                <div class="row">
                    <div class="col-6">
                        <strong>Vehicle:</strong><br>
                        <span class="text-muted">${job.vehicle || "N/A"}</span>
                    </div>
                    <div class="col-6">
                        <strong>Service:</strong><br>
                        <span class="text-muted">${job.service || "N/A"}</span>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-6">
                        <strong>Location:</strong><br>
                        <span class="text-muted">${job.location || "N/A"}</span>
                    </div>
                    <div class="col-6">
                        <strong>Client:</strong><br>
                        <span class="text-muted">${job.client || "N/A"}</span>
                    </div>
                </div>
            </div>
            ${actions}
            ${pagination}
        `;
  }

  renderActions() {
    return `
            <div class="d-grid gap-2 d-md-flex justify-content-md-start mb-3">
                <button class="btn btn-success btn-sm" data-action="accept">
                    <i class="fas fa-check me-1"></i>Accept
                </button>
                <button class="btn btn-danger btn-sm" data-action="decline">
                    <i class="fas fa-times me-1"></i>Decline
                </button>
                <button class="btn btn-outline-secondary btn-sm" data-action="view">
                    <i class="fas fa-eye me-1"></i>View Details
                </button>
            </div>
        `;
  }

  renderPagination() {
    const total = this.options.jobs.length;
    const current = this.options.currentIndex + 1;
    const hasPrev = this.options.currentIndex > 0;
    const hasNext = this.options.currentIndex < total - 1;

    return `
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Job ${current} of ${total}</small>
                <div class="btn-group">
                    <button class="btn btn-outline-secondary btn-sm" data-action="prev" ${
                      !hasPrev ? "disabled" : ""
                    }>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" data-action="next" ${
                      !hasNext ? "disabled" : ""
                    }>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
  }

  renderEmpty() {
    this.element.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                <h6 class="text-muted">No available jobs at the moment</h6>
                <small class="text-muted">Check back later for new opportunities</small>
            </div>
        `;
  }

  bindEvents() {
    this.element.addEventListener("click", (e) => {
      const action = e.target.closest("[data-action]")?.dataset.action;
      if (action) {
        e.preventDefault();
        this.handleAction(action);
      }
    });
  }

  handleAction(action) {
    const currentJob = this.options.jobs[this.options.currentIndex];

    switch (action) {
      case "prev":
        if (this.options.currentIndex > 0) {
          this.options.currentIndex--;
          this.render();
        }
        break;
      case "next":
        if (this.options.currentIndex < this.options.jobs.length - 1) {
          this.options.currentIndex++;
          this.render();
        }
        break;
      default:
        const handlers = {
          accept: this.options.onAccept,
          decline: this.options.onDecline,
          view: this.options.onView,
        };

        if (handlers[action]) {
          handlers[action](currentJob, this.options.currentIndex);
        }
    }
  }
}

window.JobListing = JobListing;
