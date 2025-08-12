import { Box, Typography, Stack, Paper, Button } from '@mui/material';
import { useAuthCtx } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TechnicianDashboard() {
  const { user, signOut } = useAuthCtx();
  const nav = useNavigate();
  return (
    <Box sx={{ p:4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb:2 }}>
        <Typography variant="h4" fontWeight={700}>Technician Dashboard</Typography>
        <Button variant="outlined" color="error" size="small" onClick={()=>{ signOut(); nav('/login'); }}>Sign Out</Button>
      </Stack>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Welcome{user?.email ? `, ${user.email}` : ''}. This is a placeholder dashboard for technician accounts.
      </Typography>
      <Stack direction={{ xs:'column', md:'row'}} spacing={3} sx={{ mt:2 }}>
        <Paper sx={{ p:3, flex:1 }}>
          <Typography fontWeight={600} gutterBottom>Upcoming Jobs</Typography>
          <Typography variant="body2" color="text.secondary">No jobs yet. This section will show assigned service requests.</Typography>
        </Paper>
        <Paper sx={{ p:3, flex:1 }}>
          <Typography fontWeight={600} gutterBottom>Earnings Snapshot</Typography>
          <Typography variant="body2" color="text.secondary">Metrics and revenue summaries will appear here.</Typography>
        </Paper>
        <Paper sx={{ p:3, flex:1 }}>
          <Typography fontWeight={600} gutterBottom>Account Status</Typography>
          <Typography variant="body2" color="text.secondary">Approval status, certification, and ratings will be displayed.</Typography>
        </Paper>
      </Stack>
    </Box>
  );
}
