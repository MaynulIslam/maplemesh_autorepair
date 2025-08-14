import { useEffect, useMemo, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, IconButton, TextField,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Stack, Divider, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material';
import { ArrowForwardIos, Search } from '@mui/icons-material';
import AppShell from '../components/Layout/AppShell';
import { listVehicles } from '../api/vehicles';
import { fetchCustomerServices, fetchServiceCatalog, createCustomerService } from '../api/services';

export default function Dashboard() {
  const [vehicles,setVehicles]=useState(null);
  // removed placeholder services table data; using real customer services below
  const [techs,setTechs]=useState([]); // placeholder
  const [catalog, setCatalog] = useState([]);
  const [custServices, setCustServices] = useState([]);
  const [vehicleIndex, setVehicleIndex] = useState(0);
  // Add Service dialog state (reusing Services page logic)
  const [addOpen, setAddOpen] = useState(false);
  const [req, setReq] = useState({ vehicle: null, odometer_km: '', serviceIds: [], description: '', urgency: '', from: '', to: '' });
  const [reqErr, setReqErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(()=>{
    listVehicles().then(v=>setVehicles(v)).catch(()=>setVehicles([]));
    // load actual customer services and catalog
    Promise.all([
      fetchCustomerServices().catch(()=>[]),
      fetchServiceCatalog().catch(()=>[])
    ]).then(([svc, cat])=>{ setCustServices(svc); setCatalog(cat); });
  // removed mock service status rows; table now uses real customer services
    setTechs([
      { id:1, name:'John Smith' },
      { id:2, name:'James Kim' },
      { id:3, name:'Maria Lopez' }
    ]);
  },[]);

  // keep index in range when vehicles list changes
  useEffect(() => {
    if (!vehicles || vehicles.length === 0) { setVehicleIndex(0); return; }
    if (vehicleIndex >= vehicles.length) setVehicleIndex(0);
  }, [vehicles?.length]);

  // auto-rotate every 5 seconds
  useEffect(() => {
    if (!vehicles || vehicles.length <= 1) return;
    const id = setInterval(() => setVehicleIndex(i => (i + 1) % vehicles.length), 5000);
    return () => clearInterval(id);
  }, [vehicles?.length]);

  const serviceName = (idOrName) => {
    const found = catalog.find(c => c.id === idOrName);
    return found ? found.name : idOrName;
  };

  const vehicleRequests = useMemo(() => {
    const byVehicle = new Map();
    for (const s of custServices) {
      const list = byVehicle.get(s.vehicle_id) || [];
      list.push(s);
      byVehicle.set(s.vehicle_id, list);
    }
    // sort each list by created_at desc
    for (const [k, list] of byVehicle.entries()) {
      list.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      byVehicle.set(k, list);
    }
    return byVehicle;
  }, [custServices]);

  const sortedHistory = useMemo(() => {
    const list = [...custServices];
    list.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    return list;
  }, [custServices]);

  function formatDate(d){
    try { return new Date(d).toLocaleDateString(undefined,{ month:'short', day:'numeric', year:'numeric'}); } catch{ return '-'; }
  }
  function formatDateTime(d){
    try { return new Date(d).toLocaleString(undefined,{ month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' }); } catch{ return '-'; }
  }

  const openAdd = (vehicle) => {
    setReqErr('');
    setReq({ vehicle, odometer_km: '', serviceIds: [], description: '', urgency: '', from: '', to: '' });
    setAddOpen(true);
  };

  const closeAdd = () => {
    if (submitting) return;
    setAddOpen(false);
    setReq({ vehicle: null, odometer_km: '', serviceIds: [], description: '', urgency: '', from: '', to: '' });
    setReqErr('');
  };

  const submitAdd = async () => {
    setReqErr('');
    if (!req.vehicle?.vehicle_id) { setReqErr('Please select a vehicle'); return; }
    const odo = parseInt(String(req.odometer_km).trim(), 10);
    if (!Number.isFinite(odo) || odo < 0) { setReqErr('Please enter a valid odometer'); return; }
    if (!req.serviceIds.length) { setReqErr('Please select at least one service'); return; }
    if (req.from && req.to) {
      const fromDt = new Date(req.from);
      const toDt = new Date(req.to);
      if (isNaN(fromDt.getTime()) || isNaN(toDt.getTime())) { setReqErr('Please provide valid schedule dates'); return; }
      if (fromDt > toDt) { setReqErr('From time must be before To time'); return; }
    }
    setSubmitting(true);
    try {
      const payload = {
        vehicle_id: req.vehicle.vehicle_id,
        odometer_km: odo,
        services: req.serviceIds,
        description: req.description?.trim() || undefined,
        urgency: req.urgency,
        schedule_from: req.from || undefined,
        schedule_to: req.to || undefined
      };
      const created = await createCustomerService(payload);
      setCustServices(prev => [created, ...prev]);
      closeAdd();
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Failed to create service';
      setReqErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const primaryVehicle = vehicles && vehicles[0];

  return (
    <AppShell>
      <Box sx={{ px:{xs:0,md:2}, pb:4 }}>
        <Grid container spacing={3}>
          {/* Vehicle hero card – shows each vehicle and its latest services */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardContent>
                {vehicles && vehicles.length ? (
                  (() => {
                    const v = vehicles[vehicleIndex];
                    const reqs = vehicleRequests.get(v.vehicle_id) || [];
                    const latest = reqs[0];
                    const svcCount = latest?.services?.length || 0;
                    const chipSx = svcCount > 2
                      ? { mr:0.5, mb:0.5, '& .MuiChip-label': { fontSize: 11, px: 0.75 } }
                      : { mr:0.5, mb:0.5 };
                    const chips = (latest?.services || []).map(id => (
                      <Chip key={id} label={serviceName(id)} size="small" sx={chipSx} />
                    ));
                    return (
                      <>
                        <Typography variant="h6" fontWeight={700}>{v.make?.toUpperCase()} {v.model} {v.year}</Typography>
                        {latest && (
                          <Stack direction="row" spacing={1} sx={{ mt:0.5 }}>
                            {latest.urgency && (
                              <Chip
                                size="small"
                                label={latest.urgency}
                                color={latest.urgency==='Urgent' ? 'error' : latest.urgency==='Soon' ? 'warning' : 'default'}
                                sx={{ height: 22 }}
                              />
                            )}
                            {latest.status && (
                              <Chip size="small" label={latest.status} variant="outlined" sx={{ height: 22 }} />
                            )}
                          </Stack>
                        )}
                        <Box sx={{ mt:1 }}>
                          {chips.length ? (
                            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0}>
                              {chips}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">No service added on this vehicle.</Typography>
                          )}
                        </Box>
                        {/* Action moved to bottom-right corner */}
                      </>
                    );
                  })()
                ) : (
                  <Skeleton variant="rounded" height={120} />
                )}
              </CardContent>
              {vehicles && vehicles.length > 1 && (
                <IconButton
                  aria-label="Next vehicle"
                  size="small"
                  onClick={()=> setVehicleIndex(i => vehicles.length ? (i + 1) % vehicles.length : 0)}
                  sx={{
                    position:'absolute',
                    right: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'transparent',
                    '&:hover': { bgcolor: 'transparent' },
                    color: 'text.secondary'
                  }}
                >
                  <ArrowForwardIos fontSize="inherit" />
                </IconButton>
              )}
              {vehicles && vehicles.length > 0 && (
                <Typography
                  variant="caption"
                  sx={{ position:'absolute', left: 8, bottom: 10, color: 'text.secondary' }}
                >
                  Showing {vehicleIndex+1} of {vehicles.length}
                </Typography>
              )}
              {vehicles && vehicles.length > 0 && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={()=> openAdd(vehicles[vehicleIndex])}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    bottom: 8,
                    textTransform: 'none',
                    borderRadius: 1,
                    bgcolor:'#022E24',
                    '&:hover':{ bgcolor:'#034433' }
                  }}
                >
                  Service Request
                </Button>
              )}
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
                    <Button
                      variant="contained"
                      sx={{ bgcolor:'#022E24', '&:hover':{ bgcolor:'#034433' }}}
                      fullWidth
                      onClick={() => openAdd(null)}
                    >
                      Book New Service
                    </Button>
                    <Button variant="outlined" fullWidth onClick={()=>setHistoryOpen(true)}>View History</Button>
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
      <Table size="small" sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor:'#041B15' }}>
                    <TableCell sx={{ color:'#fff', fontWeight:600 }}>Services</TableCell>
                    <TableCell sx={{ color:'#fff', fontWeight:600 }}>Status</TableCell>
        <TableCell sx={{ color:'#fff', fontWeight:600, width: '40%' }}>Real Time Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
          {sortedHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2" color="text.secondary">No services found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
          {sortedHistory.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{(s.services || []).map(serviceName).join(', ')}</TableCell>
            <TableCell>{renderStatus(s.status || 'Pending')}</TableCell>
                      <TableCell sx={{ width: '40%' }}>Not available</TableCell>
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
      {/* Service History Dialog */}
      <Dialog open={historyOpen} onClose={()=>setHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20 }}>Service History</DialogTitle>
        <DialogContent dividers>
          <TableContainer sx={{ maxHeight: 320 }}>
            <Table stickyHeader size="small" sx={{ '& thead th':{ background:'#04221A', color:'#fff', fontSize:'.75rem', fontWeight:600, letterSpacing:.5 }, '& td, & th':{ borderBottom:'1px solid rgba(0,0,0,0.08)' }, '& tbody tr': { height: 44 } }}>
              <TableHead>
                <TableRow>
                  <TableCell>DATE CREATED</TableCell>
                  <TableCell>VEHICLE</TableCell>
                  <TableCell>SERVICE TYPE</TableCell>
                  <TableCell>TECHNICIAN</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>URGENCY</TableCell>
                  <TableCell>SCHEDULE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedHistory.length === 0 && (
                  <TableRow><TableCell colSpan={7}><Typography variant="body2" color="text.secondary">No services found.</Typography></TableCell></TableRow>
                )}
                {sortedHistory.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell>{formatDate(s.created_at)}</TableCell>
                    <TableCell>{(() => { const veh = vehicles?.find(v => v.vehicle_id === s.vehicle_id); return veh ? `${veh.year||''} ${veh.make||''} ${veh.model||''}`.trim() : `#${s.vehicle_id}`; })()}</TableCell>
                    <TableCell>{(s.services||[]).map(serviceName).join(', ')}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{s.status}</TableCell>
                    <TableCell>{s.urgency || '-'}</TableCell>
                    <TableCell>{(s.schedule_from || s.schedule_to) ? `${s.schedule_from ? formatDateTime(s.schedule_from) : ''}${s.schedule_to ? ` → ${formatDateTime(s.schedule_to)}` : ''}` : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setHistoryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Add Service Dialog (same as Services page) */}
      <Dialog open={addOpen} onClose={closeAdd} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20 }}>Create Service Request</DialogTitle>
        <DialogContent>
          <form onSubmit={e => { e.preventDefault(); submitAdd(); }} id="dashboard-service-request-form">
            <Stack spacing={2} sx={{ mt:1 }}>
              {reqErr && <Typography variant="body2" color="error">{reqErr}</Typography>}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
                <Autocomplete
                  options={vehicles || []}
                  value={req.vehicle}
                  onChange={(e,v)=> setReq(r=>({ ...r, vehicle: v }))}
                  getOptionLabel={(v)=> v ? `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim() : ''}
                  disableClearable
                  openOnFocus
                  renderInput={(params)=>(
                    <TextField {...params} label="Vehicle" size="small" sx={{ minWidth: 140 }} required />
                  )}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="urgency-label">Urgency</InputLabel>
                  <Select
                    labelId="urgency-label"
                    label="Urgency"
                    value={req.urgency}
                    onChange={(e)=> setReq(r=>({ ...r, urgency: e.target.value }))}
                    displayEmpty
                    required
                  >
                    <MenuItem value="Urgent">Urgent</MenuItem>
                    <MenuItem value="Soon">Soon</MenuItem>
                    <MenuItem value="Regular">Regular</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Odometer (km)"
                  type="text"
                  size="small"
                  value={req.odometer_km}
                  onChange={e=> setReq(r=>({ ...r, odometer_km: e.target.value }))}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  sx={{ minWidth: 110 }}
                  required
                />
              </Box>
              <Autocomplete
                multiple
                options={catalog}
                value={req.serviceIds.map(id => catalog.find(c=>c.id===id)).filter(Boolean)}
                onChange={(e,vals)=> setReq(r=>({ ...r, serviceIds: vals.map(v=>v.id) }))}
                getOptionLabel={(o)=> o?.name || ''}
                renderInput={(params)=>(
                  <TextField {...params} label="Services" placeholder="Choose one or more" size="small" sx={{ minWidth: 180, mr: 1 }} />
                )}
              />
              <TextField
                label="Service Description"
                multiline rows={3}
                size="small"
                value={req.description}
                onChange={e=> setReq(r=>({ ...r, description: e.target.value }))}
                sx={{ minWidth: 180 }}
              />
            </Stack>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAdd} disabled={submitting}>Cancel</Button>
          <Button type="submit" form="dashboard-service-request-form" variant="contained" disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}>{submitting ? 'Creating...' : 'Create Request'}</Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}

function renderStatus(status){
  if(status === 'In Progress') return <Chip label="In Progress" size="small" color="warning" />;
  if(status === 'Overdue') return <Chip label="Overdue" size="small" color="error" />;
  if(status === 'Technician Assigned') return <Chip label="Technician Assigned" size="small" color="default" />;
  return <Chip label={status} size="small" variant="outlined" />;
}
function PromoCard({ color, text }){
  return (
    <Card sx={{ bgcolor:color, color:'#fff', p:2 }}>
      <Typography variant="body2" fontWeight={600}>{text}</Typography>
      <Typography variant="caption" sx={{ display:'block', mt:1 }}>*Terms and conditions apply</Typography>
    </Card>
  );
}