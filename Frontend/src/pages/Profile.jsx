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

export default function Profile(){
  const { user } = useAuthCtx();
  const [profile,setProfile]=useState(null);
  const [vehicles,setVehicles]=useState([]);
  const [prefs,setPrefs]=useState({ email:true, sms:true, marketing:false });

  useEffect(()=>{
    // TODO: fetch profile and vehicles; placeholders now
    setProfile({ first_name:'', last_name:'', member_since:'2025' });
    setVehicles([]);
  },[]);

  return (
    <AppShell>
      <Typography variant="h5" fontWeight={700} sx={{ mb:3 }}>Profile Settings</Typography>
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
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField label="First Name" size="small" fullWidth value={profile?.first_name || ''} disabled placeholder="First Name" /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Last Name" size="small" fullWidth value={profile?.last_name || ''} disabled placeholder="Last Name" /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Email" size="small" fullWidth value={user?.email || ''} disabled /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Phone" size="small" fullWidth value={''} disabled placeholder="(future)" /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Address Line 1" size="small" fullWidth value={''} disabled placeholder="(future)" /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Address Line 2" size="small" fullWidth value={''} disabled placeholder="(future)" /></Grid>
                <Grid item xs={12} sm={4}><TextField label="City" size="small" fullWidth value={''} disabled /></Grid>
                <Grid item xs={12} sm={4}><TextField label="Province/State" size="small" fullWidth value={''} disabled /></Grid>
                <Grid item xs={12} sm={4}><TextField label="Postal Code" size="small" fullWidth value={''} disabled /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Country" size="small" fullWidth value={''} disabled /></Grid>
                <Grid item xs={12} sm={6}><TextField label="New Password" size="small" fullWidth type="password" disabled placeholder="••••••" /></Grid>
              </Grid>
              <Button variant="contained" size="small" sx={{ mt:3 }} disabled startIcon={<EditIcon />}>Update Information</Button>
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