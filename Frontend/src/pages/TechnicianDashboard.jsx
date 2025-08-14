import { Box, Typography, Stack, Paper, Button, Grid } from "@mui/material";
import { useAuthCtx } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function TechnicianDashboard() {
  const { user, signOut } = useAuthCtx();
  const nav = useNavigate();
  // Example: fetch jobs, earnings, etc. from backend
  const [jobs, setJobs] = useState([]);
  const [earnings, setEarnings] = useState(0);
  useEffect(() => {
    // Fetch jobs
    fetch("http://localhost:8001/api/technician/jobs", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setJobs(data || []));
    // Fetch earnings
    fetch("http://localhost:8001/api/technician/earnings", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => (res.ok ? res.json() : { total: 0 }))
      .then((data) => setEarnings(data.total || 0));
  }, []);
  return (
    <Box sx={{ p: 4 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h4" fontWeight={700}>
          Technician Dashboard
        </Typography>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => {
            signOut();
            nav("/login");
          }}
        >
          Sign Out
        </Button>
      </Stack>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Welcome{user?.email ? `, ${user.email}` : ""}. Here are your technician
        tools and stats.
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3 }}>
            <Typography fontWeight={600} gutterBottom>
              Upcoming Jobs
            </Typography>
            {jobs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No jobs yet.
              </Typography>
            ) : (
              <ul style={{ paddingLeft: 16 }}>
                {jobs.slice(0, 3).map((job) => (
                  <li key={job.job_id}>
                    {job.service_type} for {job.customer_name} on{" "}
                    {new Date(job.scheduled_date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => nav("/technician-jobs")}
            >
              View All Jobs
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3 }}>
            <Typography fontWeight={600} gutterBottom>
              Earnings Snapshot
            </Typography>
            <Typography variant="h5" color="success.main">
              ${earnings.toFixed(2)}
            </Typography>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => nav("/technician-wallet")}
            >
              Wallet & Transactions
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3 }}>
            <Typography fontWeight={600} gutterBottom>
              Account Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Approval status, certification, and ratings will be displayed.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => nav("/technician-profile")}
            >
              Profile & Skills
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 3 }}>
            <Typography fontWeight={600} gutterBottom>
              Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your availability and appointments.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => nav("/technician-schedule")}
            >
              Go to Schedule
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
