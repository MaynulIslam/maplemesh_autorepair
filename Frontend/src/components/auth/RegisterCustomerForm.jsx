import { useState } from 'react';
import {
  Grid, TextField, Button, Stack, Paper, Typography, Alert, Divider
} from '@mui/material';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';

export default function RegisterCustomerForm() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    first_name:'', last_name:'', username:'', email:'', password:'',
    phone:'', dob:'', address_line_1:'', address_line_2:'',
    city:'', province:'', postal_code:'', country:'',
    vehicle_make:'', vehicle_model:'', vehicle_year:'', vehicle_color:'',
    vehicle_description:''
  });
  const [err,setErr]=useState('');
  const [ok,setOk]=useState(false);
  const [loading,setLoading]=useState(false);

  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const submit = async e => {
    e.preventDefault();
    setErr(''); setOk(false); setLoading(true);
    try {
      await api.post('/api/auth/register/customer', form);
      setOk(true);
      setTimeout(()=>nav('/login'), 1200);
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt:6, px:2 }}>
      <Paper sx={{ p:5, width:'100%', maxWidth:1000 }}>
        <Typography variant="h5" fontWeight={600} mb={1}>Customer Registration</Typography>
        <Typography variant="body2" mb={3} color="text.secondary">
          Provide your information to get started.
        </Typography>
        <form onSubmit={submit}>
          <Stack spacing={3}>
            {err && <Alert severity="error">{err}</Alert>}
            {ok && <Alert severity="success">Registered successfully. Redirecting...</Alert>}
            <Section title="Personal">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField label="First Name" value={form.first_name} onChange={set('first_name')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={6}><TextField label="Last Name" value={form.last_name} onChange={set('last_name')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={6}><TextField label="Username" value={form.username} onChange={set('username')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={6}><TextField label="Email" type="email" value={form.email} onChange={set('email')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={6}><TextField label="Password" type="password" value={form.password} onChange={set('password')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={6}><TextField label="Phone" value={form.phone} onChange={set('phone')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={6}><TextField label="Date of Birth" type="date" value={form.dob} onChange={set('dob')} required fullWidth size="small" InputLabelProps={{ shrink: true }}/></Grid>
              </Grid>
            </Section>
            <Section title="Address">
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField label="Address Line 1" value={form.address_line_1} onChange={set('address_line_1')} required fullWidth size="small"/></Grid>
                <Grid item xs={12}><TextField label="Address Line 2" value={form.address_line_2} onChange={set('address_line_2')} fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={4}><TextField label="City" value={form.city} onChange={set('city')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={4}><TextField label="Province/State" value={form.province} onChange={set('province')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={4}><TextField label="Postal Code" value={form.postal_code} onChange={set('postal_code')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={6}><TextField label="Country" value={form.country} onChange={set('country')} required fullWidth size="small"/></Grid>
              </Grid>
            </Section>
            <Section title="Vehicle">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}><TextField label="Make" value={form.vehicle_make} onChange={set('vehicle_make')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={3}><TextField label="Model" value={form.vehicle_model} onChange={set('vehicle_model')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={3}><TextField label="Year" value={form.vehicle_year} onChange={set('vehicle_year')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={3}><TextField label="Color" value={form.vehicle_color} onChange={set('vehicle_color')} fullWidth size="small"/></Grid>
                <Grid item xs={12}><TextField label="Vehicle Description" value={form.vehicle_description} onChange={set('vehicle_description')} multiline rows={3} fullWidth size="small"/></Grid>
              </Grid>
            </Section>
            <Button variant="contained" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Create Account'}</Button>
            <Button variant="text" onClick={()=>nav('/register')}>Back</Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}

function Section({ title, children }) {
  return (
    <Stack spacing={1}>
      <Divider textAlign="left" sx={{ '&::before,&::after': { borderColor: 'secondary.light' } }}>
        <Typography variant="subtitle2" color="text.secondary">{title.toUpperCase()}</Typography>
      </Divider>
      {children}
    </Stack>
  );
}