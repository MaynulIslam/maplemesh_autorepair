class DashboardController {
  constructor() {
    this.components = {};
    this.init();
  }

  init() {
    this.initializeComponents();
    this.bindGlobalEvents();
  }

  initializeComponents() {
    // Overview card
    this.components.overview = new DashboardCard(
      document.getElementById("overview-card"),
      {
        title: "Overview",
        cardType: "stats",
        content: this.getOverviewContent(),
      }
    );

    // Location & Skills combined card
    this.components.locationSkills = new DashboardCard(
      document.getElementById("location-skills-card"),
      {
        title: "Location & Skills",
        cardType: "stats",
        showEditButton: true,
        content: this.getLocationSkillsContent(),
        onEdit: () => this.handleLocationSkillsEdit(),
      }
    );

    // Upcoming Jobs card
    this.components.upcomingJobs = new DashboardCard(
      document.getElementById("upcoming-jobs-card"),
      {
        title: "Upcoming Jobs",
        cardType: "table",
        content: '<div id="jobs-table"></div>',
      }
    );

    // Initialize jobs table after card is rendered
    setTimeout(() => {
      this.components.jobsTable = new DataTable(
        document.getElementById("jobs-table"),
        {
          ...DashboardData.upcomingJobs,
          showActions: true,
          actionButtons: [
            {
              action: "start",
              text: "Start",
              class: "btn-success",
              icon: "fas fa-play",
            },
            {
              action: "details",
              text: "Details",
              class: "btn-outline-secondary",
              icon: "fas fa-info",
            },
          ],
          onAction: (action, rowIndex, rowData) =>
            this.handleJobAction(action, rowIndex, rowData),
        }
      );
    }, 100);

    // Available Jobs card
    this.components.availableJobs = new DashboardCard(
      document.getElementById("available-jobs-card"),
      {
        title: "Available Jobs",
        cardType: "default",
        content: '<div id="job-listing"></div>',
      }
    );

    setTimeout(() => {
      this.components.jobListing = new JobListing(
        document.getElementById("job-listing"),
        {
          jobs: DashboardData.availableJobs,
          onAccept: (job, index) => this.handleJobAccept(job, index),
          onDecline: (job, index) => this.handleJobDecline(job, index),
          onView: (job, index) => this.handleJobView(job, index),
        }
      );
    }, 100);

    // Recent Activity card
    this.components.recentActivity = new DashboardCard(
      document.getElementById("recent-activity-card"),
      {
        title: "Recent Activity",
        cardType: "table",
        content: '<div id="activity-list"></div>',
      }
    );

    setTimeout(() => {
      this.components.activityList = new ActivityList(
        document.getElementById("activity-list"),
        { activities: DashboardData.recentActivities }
      );
    }, 100);

    // Location Preferences card
    this.components.locationPreferences = new DashboardCard(
      document.getElementById("location-preferences-card"),
      {
        title: "Location Preferences",
        cardType: "default",
        showEditButton: true,
        content: '<div id="location-checkboxes"></div>',
        onEdit: () => this.handleLocationEdit(),
      }
    );

    setTimeout(() => {
      this.components.locationCheckboxes = new CheckboxList(
        document.getElementById("location-checkboxes"),
        {
          items: DashboardData.locationPreferences,
          disabled: true,
        }
      );
    }, 100);

    // Skill Set card
    this.components.skillSet = new DashboardCard(
      document.getElementById("skill-set-card"),
      {
        title: "Skills & Services",
        cardType: "default",
        showEditButton: true,
        content: '<div id="skill-checkboxes"></div>',
        onEdit: () => this.handleSkillEdit(),
      }
    );

    setTimeout(() => {
      this.components.skillCheckboxes = new CheckboxList(
        document.getElementById("skill-checkboxes"),
        {
          items: DashboardData.skillSet,
          disabled: true,
          showAddButton: true,
          onAdd: () => this.handleAddSkill(),
        }
      );
    }, 100);
  }

  getOverviewContent() {
    return `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h4 class="technician-count mb-0">${
                      DashboardData.technician.name
                    }</h4>
                    <p class="stats-label mb-0">Technician</p>
                </div>
                <div class="text-end">
                    <h4 class="technician-count text-warning mb-0">
                        <i class="fas fa-star"></i> ${
                          DashboardData.technician.rating.split("/")[0]
                        }
                    </h4>
                    <p class="stats-label mb-0">${
                      DashboardData.technician.rating.split("/")[1]
                    } reviews</p>
                </div>
            </div>
            <div class="mt-3">
                <span class="badge bg-success">
                    <i class="fas fa-check-circle me-1"></i>${
                      DashboardData.technician.currentJob
                    }
                </span>
            </div>
        `;
  }

  getLocationSkillsContent() {
    const locationCount = DashboardData.locationPreferences.filter(
      (item) => item.checked
    ).length;
    const skillCount = DashboardData.skillSet.filter(
      (item) => item.checked
    ).length;

    return `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h3 class="technician-count mb-0">${locationCount}</h3>
                    <p class="stats-label mb-0">Location Prefs</p>
                </div>
                <div>
                    <h3 class="technician-count text-primary mb-0">${skillCount}</h3>
                    <p class="stats-label mb-0">Active Skills</p>
                </div>
            </div>
        `;
  }

  handleLocationSkillsEdit() {
    console.log("Edit location and skills");
  }

  handleJobAction(action, rowIndex, rowData) {
    console.log("Job action:", action, "Row:", rowIndex, "Data:", rowData);
  }

  handleLocationEdit() {
    console.log("Edit location preferences");
  }

  handleSkillEdit() {
    console.log("Edit skill set");
  }

  handleAddSkill() {
    console.log("Add new skill");
  }

  handleJobAccept(job, index) {
    console.log("Accept job:", job, "Index:", index);
  }

  handleJobDecline(job, index) {
    console.log("Decline job:", job, "Index:", index);
  }

  handleJobView(job, index) {
    console.log("View job details:", job, "Index:", index);
  }

  bindGlobalEvents() {
    window.addEventListener("resize", () => {
      this.handleResize();
    });
  }

  handleResize() {
    // Handle responsive behavior if needed
  }

  destroy() {
    Object.values(this.components).forEach((component) => {
      if (component && component.destroy) {
        component.destroy();
      }
    });
  }
}

window.DashboardController = DashboardController;
