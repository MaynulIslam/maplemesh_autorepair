import { useState, useEffect } from 'react';
import { useAuthCtx } from '../context/AuthContext';
import AppShell from '../components/Layout/AppShell';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, TextField, Button, Stack,
  Divider, Table, TableHead, TableRow, TableCell, TableBody, Switch, FormControlLabel,
  Chip, Tooltip, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import api from '../api/client';

export default function Profile(){
  const { user } = useAuthCtx();
  const [profile,setProfile]=useState(null);
  const [form,setForm]=useState(null);
  const [loading,setLoading]=useState(false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const [success,setSuccess]=useState(false);
  const [editMode,setEditMode]=useState(false);
  const [dirty,setDirty]=useState(false); // tracks if any field changed after entering edit
  const [vehicles,setVehicles]=useState([]);
  const [prefs,setPrefs]=useState({ email:true, sms:true, marketing:false });

  useEffect(()=>{
    const load = async ()=>{
      setLoading(true); setError('');
      try {
        const { data } = await api.get('/api/customer/profile');
        setProfile(data); setForm(data);
        // Vehicles separately later (existing placeholder)
      } catch (e){
        setError(e.response?.data?.detail || 'Failed to load profile');
      } finally { setLoading(false); }
    };
    load();
  },[]);

  const onChange = (k)=> e => setForm(f=>{
    const val = e.target.value;
    return {...f,[k]:val};
  });

  const beginEdit = ()=>{ setEditMode(true); setSuccess(false); setError(''); setForm(profile); setDirty(false); };
  const cancelEdit = ()=>{ setEditMode(false); setForm(profile); setDirty(false); };
  const watchedKeys = ['first_name','last_name','email','phone','address_line_1','address_line_2','city','province','postal_code','country'];
  const hasChanges = form && profile && watchedKeys.some(k=>form[k]!==profile[k]);
  useEffect(()=>{ if(editMode) setDirty(hasChanges); },[hasChanges, editMode]);

  const save = async ()=>{
  if(!hasChanges) { setEditMode(false); return; }
    setSaving(true); setError(''); setSuccess(false);
    try {
      const payload = {
        first_name: form.first_name||'',
        last_name: form.last_name||'',
        email: form.email||'',
        phone: form.phone||'',
        address_line_1: form.address_line_1||'',
        address_line_2: form.address_line_2||'',
        city: form.city||'',
        province: form.province||'',
        postal_code: form.postal_code||'',
        country: form.country||''
      };
      const { data } = await api.put('/api/customer/profile', payload);
      setProfile(data); setForm(data); setSuccess(true); setEditMode(false);
    } catch(e){
      setError(e.response?.data?.detail || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <AppShell>
  <Typography variant="h5" fontWeight={700} sx={{ mb:3 }}>Profile Settings</Typography>
  {error && <Typography variant="body2" color="error" sx={{mb:2}}>{error}</Typography>}
  {success && <Typography variant="body2" color="success.main" sx={{mb:2}}>Profile updated successfully.</Typography>}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height:'100%' }}>
            <CardContent sx={{ textAlign:'center', py:6 }}>
              <Avatar sx={{ width:80, height:80, mx:'auto', mb:2, bgcolor:'#2F4550' }}>{user?.email?.[0]?.toUpperCase()}</Avatar>
              <Typography fontWeight={600}>{user?.email || 'Loading...'}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display:'block', mt:1 }}>Customer since {profile?.member_since || '...'}</Typography>
              <Button size="small" variant="outlined" startIcon={<EditIcon />} sx={{ mt:2 }} disabled>Change Avatar</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography fontWeight={600} sx={{ mb:2 }}>Personal Information</Typography>
              {!editMode && (
                <Grid container spacing={1}>
                  <InfoDisplay label="First Name" value={profile?.first_name} />
                  <InfoDisplay label="Last Name" value={profile?.last_name} />
                  <InfoDisplay label="Email" value={profile?.email} />
                  <InfoDisplay label="Phone" value={profile?.phone} />
                  <InfoDisplay label="Address Line 1" value={profile?.address_line_1} half />
                  <InfoDisplay label="Address Line 2" value={profile?.address_line_2} half />
                  <InfoDisplay label="City" value={profile?.city} third />
                  <InfoDisplay label="Province/State" value={profile?.province} third />
                  <InfoDisplay label="Postal Code" value={profile?.postal_code} third />
                  <InfoDisplay label="Country" value={profile?.country} half />
                </Grid>
              )}
              {editMode && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><TextField label="First Name" size="small" fullWidth value={form?.first_name || ''} onChange={onChange('first_name')} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Last Name" size="small" fullWidth value={form?.last_name || ''} onChange={onChange('last_name')} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Email" size="small" fullWidth value={form?.email || ''} onChange={onChange('email')} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Phone" size="small" fullWidth value={form?.phone || ''} onChange={onChange('phone')} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Address Line 1" size="small" fullWidth value={form?.address_line_1 || ''} onChange={onChange('address_line_1')} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Address Line 2" size="small" fullWidth value={form?.address_line_2 || ''} onChange={onChange('address_line_2')} /></Grid>
                  <Grid item xs={12} sm={4}><TextField label="City" size="small" fullWidth value={form?.city || ''} onChange={onChange('city')} /></Grid>
                  <Grid item xs={12} sm={4}><TextField label="Province/State" size="small" fullWidth value={form?.province || ''} onChange={onChange('province')} /></Grid>
                  <Grid item xs={12} sm={4}><TextField label="Postal Code" size="small" fullWidth value={form?.postal_code || ''} onChange={onChange('postal_code')} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Country" size="small" fullWidth value={form?.country || ''} onChange={onChange('country')} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="New Password" size="small" fullWidth type="password" disabled placeholder="(Not implemented)" /></Grid>
                </Grid>
              )}
              <Stack direction="row" spacing={1} sx={{ mt:3 }}>
                {!editMode && (
                  <Button variant="contained" size="small" startIcon={<EditIcon />} disabled={loading || !profile} onClick={beginEdit}>Update Information</Button>
                )}
                {editMode && (
                  <>
                    <Button variant="contained" size="small" color="primary" startIcon={<SaveIcon />} disabled={saving || !hasChanges} onClick={save}>{saving? 'Saving...' : (dirty? 'Save Changes' : 'Update Information')}</Button>
                    <Button size="small" disabled={saving} onClick={cancelEdit}>Cancel</Button>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Registered Vehicles */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p:0 }}>
              <Box sx={{ px:2, py:1, bgcolor:'#041B15', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <Typography fontWeight={600}>Registered Vehicles</Typography>
                <Button size="small" variant="contained" startIcon={<AddIcon />} sx={{ bgcolor:'#022E24','&:hover':{bgcolor:'#034433'} }} disabled>Add Vehicle</Button>
              </Box>
              <Table size="small" sx={{ '& td, & th':{ whiteSpace:'nowrap' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Vehicle</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>License Plate</TableCell>
                    <TableCell>Last Service</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicles.length === 0 && (
                    <TableRow><TableCell colSpan={6} style={{ color:'#666' }}>No vehicles yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Preferences */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p:0 }}>
              <Box sx={{ px:2, py:1, bgcolor:'#041B15', color:'#fff' }}>
                <Typography fontWeight={600}>Contact Preferences</Typography>
              </Box>
              <Box sx={{ p:3 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel control={<Switch checked={prefs.email} disabled />} label={<PreferenceLabel title="Email Notifications" desc="Receive service reminders, special offers and updates" />} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel control={<Switch checked={prefs.sms} disabled />} label={<PreferenceLabel title="SMS Notifications" desc="Receive text alerts about your service appointments" />} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel control={<Switch checked={prefs.marketing} disabled />} label={<PreferenceLabel title="Marketing Emails" desc="Receive promotional offers and newsletters" />} />
                  </Grid>
                </Grid>
                <Button size="small" variant="contained" sx={{ mt:3, bgcolor:'#022E24','&:hover':{bgcolor:'#034433'} }} disabled>Save Preferences</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppShell>
  );
}

function PreferenceLabel({ title, desc }){
  return (
    <Box sx={{ ml:1 }}>
      <Typography variant="body2" fontWeight={600}>{title}</Typography>
      <Typography variant="caption" color="text.secondary">{desc}</Typography>
    </Box>
  );
}

function InfoDisplay({ label, value, half, third }){
  return (
    <Grid item xs={12} sm={third?4:(half?6:6)}>
      <Box sx={{border:'1px solid', borderColor:'divider', p:1, borderRadius:1, minHeight:56, display:'flex', flexDirection:'column', justifyContent:'center'}}>
        <Typography variant='caption' color='text.secondary' sx={{fontSize:11, letterSpacing:.5}}>{label.toUpperCase()}</Typography>
        <Typography variant='body2' sx={{fontWeight:500, mt:0.25}}>{value || '—'}</Typography>
      </Box>
    </Grid>
  );
}