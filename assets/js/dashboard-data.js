const DashboardData = {
  technician: {
    name: "Alex Johnson",
    currentJob: "Currently Available",
    rating: "4.7/120",
  },

  recentActivities: [
    {
      status: "completed",
      description: "Completed brake repair - Honda Civic",
    },
    {
      status: "scheduled",
      description: "Scheduled oil change - Toyota Corolla",
    },
    { status: "pending", description: "Pending approval - Engine Diagnostics" },
  ],

  locationPreferences: [
    { id: "within10km", label: "Within 10 km", checked: true },
    { id: "garageAccess", label: "Garage access required", checked: true },
    { id: "mobileFriendly", label: "Mobile service friendly", checked: false },
  ],

  upcomingJobs: {
    headers: ["Date", "Client", "Vehicle", "Service Type", "Status"],
    data: [
      [
        "Jul 12",
        "John Smith",
        "Ford F-150",
        "Tire Rotation",
        '<span class="badge bg-warning">Scheduled</span>',
      ],
      [
        "Jul 14",
        "Maria Lopez",
        "Honda Accord",
        "Oil Change",
        '<span class="badge bg-secondary">Pending</span>',
      ],
      [
        "Jul 15",
        "David Chen",
        "Toyota Camry",
        "Brake Inspection",
        '<span class="badge bg-success">Confirmed</span>',
      ],
    ],
  },

  skillSet: [
    { id: "brakeRepair", label: "Brake Repair", checked: true },
    { id: "oilChange", label: "Oil Change", checked: true },
    { id: "acServices", label: "AC Services", checked: true },
    { id: "engineDiag", label: "Engine Diagnostics", checked: false },
  ],

  availableJobs: [
    {
      vehicle: "Nissan Altima 2022",
      service: "Engine Diagnostics",
      location: "5 km away",
      client: "Sarah Wilson",
    },
    {
      vehicle: "BMW X3 2023",
      service: "Brake Replacement",
      location: "8 km away",
      client: "Michael Brown",
    },
    {
      vehicle: "Chevrolet Malibu 2021",
      service: "Oil Change",
      location: "3 km away",
      client: "Jennifer Davis",
    },
  ],
};

window.DashboardData = DashboardData;
