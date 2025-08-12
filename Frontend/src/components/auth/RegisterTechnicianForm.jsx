import { useState } from 'react';
import {
  Grid, TextField, Button, Stack, Paper, Typography, Alert, Divider, FormControlLabel, Checkbox
} from '@mui/material';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';

export default function RegisterTechnicianForm() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    first_name:'', last_name:'', username:'', email:'', password:'',
    phone:'', dob:'', business_name:'', business_address:'', postal_code:'',
    city:'', province:'', country:'', years_experience:'', is_certified:false,
    certification_number:'', certification_authority:'', certification_expiry:'',
    areas_of_expertise:'', service_radius:''
  });
  const [err,setErr]=useState('');
  const [ok,setOk]=useState(false);
  const [loading,setLoading]=useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value}));

  const submit = async e => {
    e.preventDefault();
    setErr(''); setOk(false); setLoading(true);
    try {
      await api.post('/api/auth/register/technician', form);
      setOk(true);
      setTimeout(()=>nav('/login'), 1300);
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack alignItems="center" sx={{ mt:6, px:2 }}>
      <Paper sx={{ p:5, width:'100%', maxWidth:1100 }}>
        <Typography variant="h5" fontWeight={600} mb={1}>Technician Registration</Typography>
        <Typography variant="body2" mb={3} color="text.secondary">
          Provide professional and business details for approval.
        </Typography>
        <form onSubmit={submit}>
          <Stack spacing={3}>
            {err && <Alert severity="error">{err}</Alert>}
            {ok && <Alert severity="success">Submitted. You will be redirected...</Alert>}
            <Section title="Personal">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}><TextField label="First Name" value={form.first_name} onChange={set('first_name')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={4}><TextField label="Last Name" value={form.last_name} onChange={set('last_name')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={4}><TextField label="Username" value={form.username} onChange={set('username')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={6}><TextField label="Email" type="email" value={form.email} onChange={set('email')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={6}><TextField label="Password" type="password" value={form.password} onChange={set('password')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={4}><TextField label="Phone" value={form.phone} onChange={set('phone')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={4}><TextField label="Date of Birth" type="date" value={form.dob} onChange={set('dob')} InputLabelProps={{ shrink: true }} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={4}><TextField label="Service Radius (km)" value={form.service_radius} onChange={set('service_radius')} fullWidth size="small"/></Grid>
              </Grid>
            </Section>
            <Section title="Business">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField label="Business Name" value={form.business_name} onChange={set('business_name')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={6}><TextField label="Years Experience" value={form.years_experience} onChange={set('years_experience')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={12}><TextField label="Business Address" value={form.business_address} onChange={set('business_address')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={4}><TextField label="City" value={form.city} onChange={set('city')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={4}><TextField label="Province/State" value={form.province} onChange={set('province')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={4}><TextField label="Postal Code" value={form.postal_code} onChange={set('postal_code')} required fullWidth size="small"/></Grid>
                <Grid item xs={12} sm={6}><TextField label="Country" value={form.country} onChange={set('country')} required fullWidth size="small"/></Grid>
              </Grid>
            </Section>
            <Section title="Certification">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Checkbox checked={form.is_certified} onChange={set('is_certified')} />}
                    label="I am certified"
                  />
                </Grid>
                {form.is_certified && (
                  <>
                    <Grid item xs={12} sm={4}><TextField label="Certification #" value={form.certification_number} onChange={set('certification_number')} fullWidth size="small"/></Grid>
                    <Grid item xs={12} sm={4}><TextField label="Authority" value={form.certification_authority} onChange={set('certification_authority')} fullWidth size="small"/></Grid>
                    <Grid item xs={12} sm={4}><TextField label="Expiry" type="date" value={form.certification_expiry} onChange={set('certification_expiry')} InputLabelProps={{ shrink: true }} fullWidth size="small"/></Grid>
                  </>
                )}
                <Grid item xs={12}><TextField label="Areas of Expertise (comma separated)" value={form.areas_of_expertise} onChange={set('areas_of_expertise')} fullWidth size="small"/></Grid>
              </Grid>
            </Section>
            <Button variant="contained" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Create Technician Account'}</Button>
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
      <Divider textAlign="left">
        <Typography variant="subtitle2" color="text.secondary">{title.toUpperCase()}</Typography>
      </Divider>
      {children}
    </Stack>
  );
}