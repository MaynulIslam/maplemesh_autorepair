import { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, IconButton, TextField,
  Table, TableHead, TableRow, TableCell, TableBody, Paper, Stack, Divider, Skeleton
} from '@mui/material';
import { ArrowForwardIos, Search } from '@mui/icons-material';
import AppShell from '../components/Layout/AppShell';
import { listVehicles } from '../api/vehicles';

export default function Dashboard() {
  const [vehicles,setVehicles]=useState(null);
  const [services,setServices]=useState([]); // placeholder data
  const [techs,setTechs]=useState([]); // placeholder

  useEffect(()=>{
    listVehicles().then(v=>setVehicles(v)).catch(()=>setVehicles([]));
    // mock service status data – integrate real endpoint later
    setServices([
      { id:1, name:'Tire Rotation - TOYOTA RAV4', status:'Technician Assigned', realtime:'' },
      { id:2, name:'Oil Change - TOYOTA RAV4', status:'Pending', realtime:'' },
      { id:3, name:'Brake Inspection - TOYOTA RAV4', status:'In Progress', realtime:'In Progress' },
      { id:4, name:'Battery Replacement - TOYOTA RAV4', status:'Overdue', realtime:'Overdue' }
    ]);
    setTechs([
      { id:1, name:'John Smith' },
      { id:2, name:'James Kim' },
      { id:3, name:'Maria Lopez' }
    ]);
  },[]);

  const primaryVehicle = vehicles && vehicles[0];

  return (
    <AppShell>
      <Box sx={{ px:{xs:0,md:2}, pb:4 }}>
        <Grid container spacing={3}>
          {/* Vehicle hero card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                {primaryVehicle ? (
                  <>
                    <Typography variant="h6" fontWeight={700}>{primaryVehicle.make?.toUpperCase()} {primaryVehicle.model} {primaryVehicle.year}</Typography>
                    <Typography variant="body2" color="success.dark" sx={{ mt:1 }}>Tire Rotation Due in 3 months</Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt:2 }}>
                      <Chip label="Service Request" size="small" color="success" sx={{ fontWeight:600 }} />
                      <IconButton size="small"><ArrowForwardIos fontSize="inherit" /></IconButton>
                    </Stack>
                  </>
                ) : (
                  <Skeleton variant="rounded" height={120} />
                )}
              </CardContent>
            </Card>
          </Grid>
          {/* Technicians availability */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height:'100%' }}>
              <CardContent>
                <Typography variant="h6" color="primary" fontWeight={700}>Technicians Availability</Typography>
                <Grid container spacing={1} sx={{ mt:2 }}>
                  <Grid item xs={6}>
                    <Typography variant="h4" fontWeight={700}>28</Typography>
                    <Typography variant="caption" color="text.secondary">Total Technicians</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" fontWeight={700} color="success.main">5</Typography>
                    <Typography variant="caption" color="text.secondary">On Call Available</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {/* Quick Actions */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height:'100%' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" fontWeight={700}>Quick Actions</Typography>
                  <Stack spacing={1} sx={{ mt:2 }}>
                    <Button variant="contained" sx={{ bgcolor:'#022E24', '&:hover':{ bgcolor:'#034433' }}} fullWidth>Book New Service</Button>
                    <Button variant="outlined" fullWidth>View History</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

          {/* Service & Repair Status table */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ overflow:'hidden' }}>
              <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:2, py:1, bgcolor:'#041B15', color:'#fff' }}>
                <Typography fontWeight={700}>Service & Repair Status</Typography>
                <TextField size="small" placeholder="Search services..." InputProps={{ startAdornment:<Search fontSize="small" sx={{ mr:1 }} /> }} sx={{ bgcolor:'#fff', borderRadius:1, width:260 }} />
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor:'#041B15' }}>
                    <TableCell sx={{ color:'#fff', fontWeight:600 }}>Services</TableCell>
                    <TableCell sx={{ color:'#fff', fontWeight:600 }}>Status</TableCell>
                    <TableCell sx={{ color:'#fff', fontWeight:600 }}>Real Time Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{renderStatus(row.status)}</TableCell>
                      <TableCell>{renderRealtime(row.realtime)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          {/* Favorite Technicians + Promotions */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ overflow:'hidden' }}>
              <Box sx={{ px:2, py:1, bgcolor:'#041B15', color:'#fff' }}>
                <Typography fontWeight={700}>Find Your Favorite Technician Here</Typography>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Technician</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Edit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {techs.map(t=>(
                    <TableRow key={t.id}>
                      <TableCell>{t.name}</TableCell>
                      <TableCell><Button size="small" variant="outlined">Add</Button></TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="outlined">Remove</Button>
                          <Button size="small" color="error" variant="outlined">Delete</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ p:2, pt:0 }}>
                <Typography variant="caption" color="text.secondary">You can save one more favorite technician of yours</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <PromoCard color="#3D82F4" text="SAVE UPTO 50% ON YOUR FIRST CAR SERVICING! REFER YOUR FRIEND TODAY." />
              <PromoCard color="#DA9A16" text="GET 30% DISCOUNT FROM SHELL WHEN YOU CHANGE ENGINE OIL THROUGH US!" />
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </AppShell>
  );
}

function renderStatus(status){
  if(status === 'In Progress') return <Chip label="In Progress" size="small" color="warning" />;
  if(status === 'Overdue') return <Chip label="Overdue" size="small" color="error" />;
  if(status === 'Technician Assigned') return <Chip label="Technician Assigned" size="small" color="default" />;
  return <Chip label={status} size="small" variant="outlined" />;
}
function renderRealtime(rt){
  if(rt === 'In Progress') return <Chip label="In Progress" size="small" color="warning" />;
  if(rt === 'Overdue') return <Chip label="Overdue" size="small" color="error" />;
  return rt;
}
function PromoCard({ color, text }){
  return (
    <Card sx={{ bgcolor:color, color:'#fff', p:2 }}>
      <Typography variant="body2" fontWeight={600}>{text}</Typography>
      <Typography variant="caption" sx={{ display:'block', mt:1 }}>*Terms and conditions apply</Typography>
    </Card>
  );
}