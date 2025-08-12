import { Stack, Paper, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function RegisterChoice() {
  const nav = useNavigate();
  return (
    <Stack alignItems="center" sx={{ mt: 8, px:2 }}>
      <Paper sx={{ p:5, width:'100%', maxWidth:560 }}>
        <Typography variant="h5" mb={2} fontWeight={600}>Create Your Account</Typography>
        <Typography variant="body2" mb={4} color="text.secondary">
          Choose how you want to use MapleMesh AutoRepair.
        </Typography>
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p:3, display:'flex', flexDirection:'column', gap:1 }}>
            <Typography variant="h6">I want to fix my vehicle</Typography>
            <Typography variant="body2" color="text.secondary">
              Book services, manage your vehicles, track service history.
            </Typography>
            <Button variant="contained" sx={{ mt:1 }} onClick={()=>nav('/register/customer')}>
              Register as Customer
            </Button>
          </Paper>
          <Paper variant="outlined" sx={{ p:3, display:'flex', flexDirection:'column', gap:1 }}>
            <Typography variant="h6">I am a technician</Typography>
            <Typography variant="body2" color="text.secondary">
              Offer services, manage jobs, build reputation and billing.
            </Typography>
            <Button variant="outlined" sx={{ mt:1 }} onClick={()=>nav('/register/technician')}>
              Register as Technician
            </Button>
          </Paper>
        </Stack>
      </Paper>
    </Stack>
  );
}