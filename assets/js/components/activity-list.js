class ActivityList extends BaseComponent {
  get defaultOptions() {
    return {
      activities: [],
    };
  }

  getIconClass(status) {
    const iconMap = {
      completed: "fa fa-check text-success",
      scheduled: "fa fa-clock text-warning",
      pending: "fa fa-hourglass-half text-secondary",
    };
    return iconMap[status] || "fa fa-circle text-muted";
  }

  render() {
    const activities = this.options.activities
      .map(
        (activity) => `
            <li>
                <i class="${this.getIconClass(activity.status)}"></i> ${
          activity.description
        }
            </li>
        `
      )
      .join("");

    this.element.innerHTML = `
            <ul class="list-unstyled mb-0">
                ${activities}
            </ul>
        `;
  }
}

window.ActivityList = ActivityList;
