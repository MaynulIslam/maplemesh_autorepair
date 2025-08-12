import { useAuthCtx } from '../context/AuthContext';
import {
  Typography, Paper, Stack, Grid, TextField, Button, Divider
} from '@mui/material';
import AppShell from '../components/Layout/AppShell';

export default function Profile() {
  const { user } = useAuthCtx();
  return (
    <AppShell>
      <Typography variant="h4" gutterBottom>Profile</Typography>
      <Paper sx={{ p:4 }}>
        <Stack spacing={3}>
          <Typography variant="h6">Account Details</Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField label="Email" value={user?.email || ''} size="small" fullWidth disabled /></Grid>
            <Grid item xs={12} sm={6}><TextField label="User Type" value={user?.user_type || ''} size="small" fullWidth disabled /></Grid>
            <Grid item xs={12} sm={6}><TextField label="First Name" value="" placeholder="(future)" size="small" fullWidth disabled /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Last Name" value="" placeholder="(future)" size="small" fullWidth disabled /></Grid>
          </Grid>
          <Button variant="contained" disabled>Save Changes (Coming Soon)</Button>
        </Stack>
      </Paper>
    </AppShell>
  );
}