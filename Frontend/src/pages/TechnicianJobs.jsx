// TechnicianJobs.jsx
// Converted from technician_jobs.html
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faPlay,
  faCheck,
  faDollarSign,
  faHistory,
  faSearch,
  faEye,
  faTimes,
  faCheckDouble,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";

const TechnicianJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState({
    status: "",
    service: "",
    date: "",
    search: "",
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8001/api/technician/jobs", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setJobs(data || []);
        setLoading(false);
      });
  }, []);

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = !filter.status || job.status === filter.status;
    const matchesService =
      !filter.service || job.service_type === filter.service;
    const matchesDate = !filter.date || job.created_at?.startsWith(filter.date);
    const matchesSearch =
      !filter.search ||
      job.customer_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
      job.vehicle_make?.toLowerCase().includes(filter.search.toLowerCase()) ||
      job.service_type?.toLowerCase().includes(filter.search.toLowerCase());
    return matchesStatus && matchesService && matchesDate && matchesSearch;
  });

  // Job status counts
  const pending = jobs.filter((j) => j.status === "pending").length;
  const active = jobs.filter((j) =>
    ["accepted", "in_progress"].includes(j.status)
  ).length;
  const completed = jobs.filter((j) => j.status === "completed").length;
  const earnings = jobs
    .filter((j) => j.status === "completed")
    .reduce((sum, j) => sum + (j.price || 0), 0);

  return (
    <Box sx={{ bgcolor: "grey.100", minHeight: "100vh", py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
        <Typography variant="h4" fontWeight={700} mb={4}>
          Technician Jobs
        </Typography>
        {/* Status Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <FontAwesomeIcon
                icon={faClock}
                style={{ fontSize: 32, color: "#fbc02d", marginBottom: 8 }}
              />
              <Typography color="primary" fontWeight={600}>
                Pending Jobs
              </Typography>
              <Typography variant="h4">{pending}</Typography>
              <Typography variant="body2">Awaiting Acceptance</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <FontAwesomeIcon
                icon={faPlay}
                style={{ fontSize: 32, color: "#1976d2", marginBottom: 8 }}
              />
              <Typography color="primary" fontWeight={600}>
                Active Jobs
              </Typography>
              <Typography variant="h4">{active}</Typography>
              <Typography variant="body2">In Progress</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <FontAwesomeIcon
                icon={faCheck}
                style={{ fontSize: 32, color: "#388e3c", marginBottom: 8 }}
              />
              <Typography color="primary" fontWeight={600}>
                Completed
              </Typography>
              <Typography variant="h4">{completed}</Typography>
              <Typography variant="body2">This Month</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <FontAwesomeIcon
                icon={faDollarSign}
                style={{ fontSize: 32, color: "#388e3c", marginBottom: 8 }}
              />
              <Typography color="primary" fontWeight={600}>
                Total Earnings
              </Typography>
              <Typography variant="h4">${earnings.toFixed(2)}</Typography>
              <Typography variant="body2">This Month</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={filter.status}
                  onChange={(e) =>
                    setFilter((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Service</InputLabel>
                <Select
                  label="Service"
                  value={filter.service}
                  onChange={(e) =>
                    setFilter((f) => ({ ...f, service: e.target.value }))
                  }
                >
                  <MenuItem value="">All Services</MenuItem>
                  <MenuItem value="oil_change">Oil Change</MenuItem>
                  <MenuItem value="brake_repair">Brake Repair</MenuItem>
                  <MenuItem value="tire_service">Tire Service</MenuItem>
                  <MenuItem value="engine_diagnostic">
                    Engine Diagnostic
                  </MenuItem>
                  <MenuItem value="ac_service">A/C Service</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={filter.date}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, date: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search jobs..."
                value={filter.search}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, search: e.target.value }))
                }
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Jobs Table */}
        <Paper sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Job Requests</Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => window.location.reload()}
              startIcon={<FontAwesomeIcon icon={faRefresh} />}
            >
              Refresh
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>JOB ID</TableCell>
                  <TableCell>DATE</TableCell>
                  <TableCell>CUSTOMER</TableCell>
                  <TableCell>VEHICLE</TableCell>
                  <TableCell>SERVICE</TableCell>
                  <TableCell>LOCATION</TableCell>
                  <TableCell>PRICE</TableCell>
                  <TableCell>STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No jobs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow key={job.job_id}>
                      <TableCell>#{job.job_id}</TableCell>
                      <TableCell>
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString()
                          : ""}
                      </TableCell>
                      <TableCell>{job.customer_name}</TableCell>
                      <TableCell>
                        {job.vehicle_make} {job.vehicle_model}
                      </TableCell>
                      <TableCell>{job.service_type}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>${job.price?.toFixed(2) || "TBD"}</TableCell>
                      <TableCell>{job.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default TechnicianJobs;
