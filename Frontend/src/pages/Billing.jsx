import { Typography, Paper, Stack, Divider, Button } from '@mui/material';
import AppShell from '../components/Layout/AppShell';

export default function Billing() {
  return (
    <AppShell>
      <Typography variant="h4" gutterBottom>Billing</Typography>
      <Paper sx={{ p:4, mb:3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Current Plan</Typography>
          <Divider />
          <Typography variant="body2" color="text.secondary">Starter (Free)</Typography>
          <Button variant="contained" disabled>Upgrade (Coming Soon)</Button>
        </Stack>
      </Paper>
      <Paper sx={{ p:4 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Recent Invoices</Typography>
          <Divider />
          <Typography variant="body2" color="text.secondary">No invoices yet.</Typography>
        </Stack>
      </Paper>
    </AppShell>
  );
}