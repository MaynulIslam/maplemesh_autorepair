import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Grid, Paper, Button, Stack, Chip, Table, TableBody, TableCell, TableHead, TableRow, TextField, LinearProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, CircularProgress, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import { fetchCustomerServices, fetchServiceCatalog, createCustomerService, fetchVehicles, updateCustomerService } from '../api/services';
import AppShell from '../components/Layout/AppShell';
import { useToastCtx } from '../context/ToastContext';

export default function Services(){
  // Error state for edit dialog
  const [editErr, setEditErr] = useState("");
  // Edit Service dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editService, setEditService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [search, setSearch] = useState('');
  const toast = useToastCtx();
  // Index of the service shown in the "Your Services" box
  const [svcIndex, setSvcIndex] = useState(0);

  // Add Service dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const initialReq = { vehicle: null, odometer_km: '', serviceIds: [], description: '', urgency: '', from: '', to: '' };
  const [req, setReq] = useState(initialReq);
  const [reqErr, setReqErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(()=>{
    let active=true;
    (async ()=>{
      setLoading(true); setError(null);
      try {
        const [svc, cat, veh] = await Promise.all([
          fetchCustomerServices(),
          fetchServiceCatalog(),
          fetchVehicles()
        ]);
        if(!active) return;
        setServices(svc);
        setCatalog(cat);
        setVehicles(veh);
      } catch(e){
        console.error(e);
        active && setError('Failed to load services. Please check your backend server and API connection.');
      } finally { active && setLoading(false); }
    })();
    return ()=>{ active=false; };
  },[]);

  // Keep index in range when services list changes
  useEffect(()=>{
    if (services.length === 0) {
      setSvcIndex(0);
    } else if (svcIndex >= services.length) {
      setSvcIndex(0);
    }
  }, [services.length]);

  const serviceName = (idOrName) => {
    // If the stored value is already a name, return as-is; otherwise map id -> name
    const found = catalog.find(c => c.id === idOrName);
    return found ? found.name : idOrName;
  };

  const filtered = useMemo(()=> services.filter(s=>{
    if(!search.trim()) return true;
  return (s.services||[]).some(id=> serviceName(id).toLowerCase().includes(search.toLowerCase())) ||
           (s.status||'').toLowerCase().includes(search.toLowerCase());
  }), [services, search]);

  function formatDate(d){
    try { return new Date(d).toLocaleDateString(undefined,{ month:'short', day:'numeric', year:'numeric'}); } catch{ return '-'; }
  }
  function formatDateTime(d){
    try { return new Date(d).toLocaleString(undefined,{ month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' }); } catch{ return '-'; }
  }

  const recommended = useMemo(()=>[
    { name:'Cabin Air Filter Replacement', date:'August 2025' },
    { name:'Brake Fluid Flush', date:'September 2025' },
    { name:'Battery Check', date:'October 2025' }
  ],[]);

  const openAdd = async () => {
    setReqErr('');
    setAddOpen(true);
    try {
      const list = await fetchVehicles();
      setVehicles(list);
    } catch (e) {
      toast?.error('Failed to load vehicles');
    }
  };

  const closeAdd = () => {
    if (submitting) return;
  setAddOpen(false);
  setReq(initialReq);
    setReqErr('');
  };

  const submitAdd = async () => {
    setReqErr('');
    if (!req.vehicle?.vehicle_id) { setReqErr('Please select a vehicle'); return; }
    const odo = parseInt(String(req.odometer_km).trim(), 10);
    if (!Number.isFinite(odo) || odo < 0) { setReqErr('Please enter a valid odometer'); return; }
    if (!req.serviceIds.length) { setReqErr('Please select at least one service'); return; }
    // Validate schedule window if provided
    if (req.from && req.to) {
      const fromDt = new Date(req.from);
      const toDt = new Date(req.to);
      if (isNaN(fromDt.getTime()) || isNaN(toDt.getTime())) {
        setReqErr('Please provide valid schedule dates');
        return;
      }
      if (fromDt > toDt) {
        setReqErr('From time must be before To time');
        return;
      }
    }
    setSubmitting(true);
    try {
      const payload = {
        vehicle_id: req.vehicle.vehicle_id,
        odometer_km: odo,
        services: req.serviceIds,
        description: req.description?.trim() || undefined,
        urgency: req.urgency, // backend currently ignores extras
        schedule_from: req.from || undefined,
        schedule_to: req.to || undefined
      };
      const created = await createCustomerService(payload);
      setServices(prev => [created, ...prev]);
      toast?.success('Service request created');
      closeAdd();
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Failed to create service';
      setReqErr(msg);
      toast?.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
    <Box sx={{ px:2, py:1 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb:3, letterSpacing:.5 }}>Service Management</Typography>

      {loading && <LinearProgress sx={{ mb:2 }} />}
      {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
      {/* Fallback for blank page: show error if nothing loaded and not loading */}
      {!loading && !services.length && error && (
        <Box sx={{ mt:4, textAlign:'center' }}>
          <Typography variant="h6" color="error">{error}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt:2 }}>If you see this message, please check your backend server, API endpoints, and browser console for errors.</Typography>
        </Box>
      )}
      {/* ...existing code... */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p:0, mb:3, display:'flex', flexDirection:'column', position:'relative' }} elevation={1}>
            <Box sx={{ px:3, pt:3 }}>
              <Button variant="contained" size="small" disableElevation sx={{ background:'#04221A', '&:hover':{ background:'#063428' }, textTransform:'none', fontWeight:600, borderRadius:1, boxShadow:'none' }}>Your Services</Button>
              <Box sx={{ mt:2, minHeight:64 }}>
                {error && <Typography variant="body2" color="error">Failed to load services.</Typography>}
                {!error && services.length===0 && !loading && <Typography variant="body2" color="text.secondary">No active services.</Typography>}
                {!error && services.length>0 && (()=>{
                  const current = services[svcIndex] || services[0];
                  const veh = vehicles.find(v=> v.vehicle_id === current.vehicle_id);
                  return (
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {(current.services||[]).slice(0,6).map(id => <Chip key={id} size="small" label={serviceName(id)} />)}
                      </Stack>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={12} sm={6}><Typography variant="caption"><strong>Vehicle:</strong> {veh ? `${veh.year||''} ${veh.make||''} ${veh.model||''}`.trim() : `#${current.vehicle_id}`}</Typography></Grid>
                        <Grid item xs={6} sm={3}><Typography variant="caption"><strong>Odometer:</strong> {current.odometer_km ?? '-'}</Typography></Grid>
                        <Grid item xs={6} sm={3}><Typography variant="caption"><strong>Status:</strong> {current.status}</Typography></Grid>
                        {current.urgency && (
                          <Grid item xs={12} sm={6}><Typography variant="caption"><strong>Urgency:</strong> <Chip size="small" label={current.urgency} color={current.urgency==='Urgent' ? 'error' : current.urgency==='Soon' ? 'warning' : 'default'} sx={{ height:20 }} /></Typography></Grid>
                        )}
                        <Grid item xs={12}><Typography variant="caption" color="text.secondary">Created: {formatDate(current.created_at)}</Typography></Grid>
                        {(current.schedule_from || current.schedule_to) && (
                          <Grid item xs={12}><Typography variant="caption"><strong>Schedule:</strong> {current.schedule_from ? formatDateTime(current.schedule_from) : '-'}{current.schedule_to ? ` → ${formatDateTime(current.schedule_to)}` : ''}</Typography></Grid>
                        )}
                        {current.description && (
                          <Grid item xs={12}><Typography variant="caption"><strong>Notes:</strong> {current.description}</Typography></Grid>
                        )}
                      </Grid>
                    </Stack>
                  );
                })()}
              </Box>
            </Box>
            {/* Right-side arrow to cycle services, no background */}
            {services.length > 1 && (
              <IconButton
                aria-label="Next service"
                size="small"
                onClick={()=> setSvcIndex(i => (i + 1) % services.length)}
                sx={{
                  position:'absolute',
                  right: 4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'transparent',
                  '&:hover': { bgcolor: 'transparent' },
                  color: 'text.secondary'
                }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            )}
            <Box sx={{ px:3, pb:2, pt:1, display:'flex', justifyContent:'flex-end', gap:1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                sx={{ textTransform:'none', borderRadius:1 }}
                disabled={services.length===0}
                onClick={() => {
                  const latest = services[0];
                  setEditService({ ...latest });
                  setEditOpen(true);
                }}
              >Edit Service</Button>
      {/* Edit Service Dialog */}
      <Dialog open={editOpen} onClose={()=>setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20 }}>Edit Service</DialogTitle>
        <DialogContent>
          {editService && (
            <form onSubmit={async e => {
              e.preventDefault();
              setEditErr("");
              if (!editService.services || editService.services.length === 0) {
                setEditErr("Please select at least one service.");
                return;
              }
              try {
                const payload = {};
                if (editService.vehicle_id) payload.vehicle_id = editService.vehicle_id;
                const odo = parseInt(String(editService.odometer_km ?? '').trim(), 10);
                if (Number.isFinite(odo)) payload.odometer_km = odo;
                if (Array.isArray(editService.services) && editService.services.length) payload.services = editService.services;
                if (typeof editService.description === 'string' && editService.description.trim() !== '') payload.description = editService.description.trim();
                if (editService.urgency) payload.urgency = editService.urgency;
                if (editService.schedule_from) payload.schedule_from = editService.schedule_from;
                if (editService.schedule_to) payload.schedule_to = editService.schedule_to;
                const updated = await updateCustomerService(editService.id, payload);
                setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
                toast?.success('Service updated');
                setEditOpen(false);
              } catch (e) {
                console.error('Update service failed:', e?.response || e);
                const msg = e?.response?.data?.detail || e?.message || 'Failed to update service';
                setEditErr(msg);
                toast?.error(msg);
              }
            }} id="edit-service-form">
              <Stack spacing={2} sx={{ mt:1 }}>
                <Autocomplete
                  options={vehicles}
                  value={vehicles.find(v=>v.vehicle_id===editService.vehicle_id) || null}
                  getOptionLabel={(v)=> v ? `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim() : ''}
                  disableClearable
                  openOnFocus
                  popupIcon={null}
                  onChange={(e,v)=> setEditService(s=>({ ...s, vehicle_id: v?.vehicle_id }))}
                  renderInput={(params)=>(
                    <TextField {...params} label="Vehicle" size="small" sx={{ minWidth: 140 }} required />
                  )}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="edit-urgency-label">Urgency</InputLabel>
                  <Select
                    labelId="edit-urgency-label"
                    label="Urgency"
                    value={editService.urgency}
                    onChange={(e)=> setEditService(s=>({ ...s, urgency: e.target.value }))}
                    displayEmpty
                    required
                  >
                    <MenuItem value=""><em>Select urgency</em></MenuItem>
                    <MenuItem value="Urgent">Urgent</MenuItem>
                    <MenuItem value="Soon">Soon</MenuItem>
                    <MenuItem value="Regular">Regular</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Odometer (km)"
                  type="text"
                  size="small"
                  value={editService.odometer_km}
                  onChange={e=> setEditService(s=>({ ...s, odometer_km: e.target.value }))}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  sx={{ minWidth: 110 }}
                  required
                />
                <Autocomplete
                  multiple
                  options={catalog}
                  value={editService.services.map(id => catalog.find(c=>c.id===id)).filter(Boolean)}
                  onChange={(e,vals)=> setEditService(s=>({ ...s, services: vals.map(v=>v.id) }))}
                  getOptionLabel={(o)=> o?.name || ''}
                  popupIcon={null}
                  renderInput={(params)=>(
                    <TextField {...params} label="Services" size="small" sx={{ minWidth: 180, mr: 1 }} error={!!editErr} helperText={editErr} />
                  )}
                />
                <TextField
                  label="Service Description"
                  multiline rows={3}
                  size="small"
                  value={editService.description}
                  onChange={e=> setEditService(s=>({ ...s, description: e.target.value }))}
                  sx={{ minWidth: 180 }}
                />
                <Typography variant="body2" fontWeight={600} sx={{ mb:1 }}>Schedule</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="From"
                      type="datetime-local"
                      size="small"
                      value={editService.schedule_from||''}
                      onChange={e=> setEditService(s=>({ ...s, schedule_from: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      sx={{ minWidth: 140, mr: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="To"
                      type="datetime-local"
                      size="small"
                      value={editService.schedule_to||''}
                      onChange={e=> setEditService(s=>({ ...s, schedule_to: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      sx={{ minWidth: 140 }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </form>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setEditOpen(false)}>Cancel</Button>
          <Button type="submit" form="edit-service-form" variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
              <Button onClick={openAdd} variant="contained" size="small" startIcon={<AddIcon />} sx={{ textTransform:'none', fontWeight:600, background:'#04221A', '&:hover':{ background:'#063428' }, borderRadius:1 }}>Add Service</Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p:3, height:'100%', display:'flex', flexDirection:'column', gap:1.5 }} elevation={1}>
            <Typography variant="h6" fontWeight={700}>Service Packages</Typography>
            <Typography variant="body2" color="text.secondary">View our maintenance packages and special offers.</Typography>
            <Box sx={{ flexGrow:1 }} />
            <Button variant="outlined" size="small" sx={{ alignSelf:'flex-start', textTransform:'none', borderRadius:1 }}>View Packages</Button>
          </Paper>
        </Grid>

        {/* Service History */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p:0 }}>
            <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:3, pt:2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Service History</Typography>
              <Box sx={{ display:'flex', alignItems:'center', gap:1, pb:1 }}>
                <TextField
                  size="small"
                  placeholder="Search services..."
                  value={search}
                  onChange={e=> setSearch(e.target.value)}
                  InputProps={{ startAdornment:<SearchIcon fontSize="small" style={{ marginRight:4, opacity:.6 }} /> }}
                  sx={{ width:260, '& .MuiOutlinedInput-root':{ borderRadius:2 } }}
                />
              </Box>
            </Box>
            <Box sx={{ mt:1 }}>
              <Table size="small" sx={{ '& thead th':{ background:'#04221A', color:'#fff', fontSize:'.75rem', fontWeight:600, letterSpacing:.5 }, '& td, & th':{ borderBottom:'1px solid rgba(0,0,0,0.08)' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>SERVICE DATE</TableCell>
                    <TableCell>SERVICE TYPE</TableCell>
                    <TableCell>TECHNICIAN</TableCell>
                    <TableCell>STATUS</TableCell>
                    <TableCell>URGENCY</TableCell>
                    <TableCell>SCHEDULE</TableCell>
                    <TableCell>ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {error && (
                    <TableRow><TableCell colSpan={7}><Typography variant="body2" color="error">Failed to load services</Typography></TableCell></TableRow>
                  )}
                  {!error && filtered.length===0 && !loading && (
                    <TableRow><TableCell colSpan={7}><Typography variant="body2" color="text.secondary">No matching services.</Typography></TableCell></TableRow>
                  )}
          {!error && filtered.map(s=> (
                    <TableRow key={s.id} hover>
                      <TableCell>{formatDate(s.created_at)}</TableCell>
                      <TableCell>{(s.services||[]).map(serviceName).join(', ')}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{s.status}</TableCell>
            <TableCell>{s.urgency || '-'}</TableCell>
            <TableCell>{(s.schedule_from || s.schedule_to) ? `${s.schedule_from ? formatDateTime(s.schedule_from) : ''}${s.schedule_to ? ` → ${formatDateTime(s.schedule_to)}` : ''}` : '-'}</TableCell>
                      <TableCell><Button size="small" variant="text" sx={{ textTransform:'none' }}>View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Grid>

        {/* Recommended & Promotions */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p:0 }}>
            <Box sx={{ px:3, pt:2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Recommended Services</Typography>
            </Box>
            <Table size="small" sx={{ mt:1, '& thead th':{ background:'#04221A', color:'#fff', fontSize:'.75rem', fontWeight:600 }, '& td, & th':{ borderBottom:'1px solid rgba(0,0,0,0.08)' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>SERVICE</TableCell>
                  <TableCell>RECOMMENDED DATE</TableCell>
                  <TableCell>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recommended.map(r => (
                  <TableRow key={r.name}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell><Button size="small" variant="outlined" sx={{ textTransform:'none', borderRadius:1 }}>Schedule</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={2} sx={{ height:'100%' }}>
            <Paper elevation={1} sx={{ flex:1, p:0, display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', bgcolor:'#4e8be9', color:'#fff', px:3 }}>
              <Typography fontSize={14} fontWeight={600} sx={{ letterSpacing:.5 }}>SAVE UPTO 50% ON YOUR FIRST CAR SERVICING!<br/>REFER YOUR FRIEND TODAY.</Typography>
            </Paper>
            <Paper elevation={1} sx={{ flex:1, p:0, display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', bgcolor:'linear-gradient(90deg,#d29400,#b67000)', color:'#fff', px:3 }}>
              <Typography fontSize={14} fontWeight={600} sx={{ letterSpacing:.5 }}>GET 30% DISCOUNT FROM SHELL WHEN YOU<br/>CHANGE ENGINE OIL THROUGH US!</Typography>
            </Paper>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign:'center', mt:-1 }}>*Terms and conditions apply</Typography>
          </Stack>
        </Grid>
      </Grid>
      {/* Add Service Dialog */}
      <Dialog open={addOpen} onClose={closeAdd} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20 }}>Create Service Request</DialogTitle>
        <DialogContent>
          <form onSubmit={e => { e.preventDefault(); submitAdd(); }} id="service-request-form">
            <Stack spacing={2} sx={{ mt:1 }}>
              {reqErr && <Alert severity="error" onClose={()=>setReqErr('')}>{reqErr}</Alert>}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
                <Autocomplete
                  options={vehicles}
                  value={req.vehicle}
                  onChange={(e,v)=> setReq(r=>({ ...r, vehicle: v }))}
                  getOptionLabel={(v)=> v ? `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim() : ''}
                  loading={!vehicles}
                  disableClearable
                  openOnFocus
                  popupIcon={null}
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
                popupIcon={null}
                renderInput={(params)=>(
                  <TextField {...params} label="Services" placeholder="Choose one or more" size="small" sx={{ minWidth: 180, mr: 1 }} error={!!reqErr && reqErr.includes('service')} helperText={reqErr && reqErr.includes('service') ? reqErr : undefined} />
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
              <Typography variant="body2" fontWeight={600} sx={{ mb:1 }}>Schedule</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="From"
                    type="datetime-local"
                    size="small"
                    value={req.from}
                    onChange={e=> setReq(r=>({ ...r, from: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 140, mr: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="To"
                    type="datetime-local"
                    size="small"
                    value={req.to}
                    onChange={e=> setReq(r=>({ ...r, to: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 140 }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAdd} disabled={submitting}>Cancel</Button>
          <Button type="submit" form="service-request-form" variant="contained" disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}>{submitting ? 'Creating...' : 'Create Request'}</Button>
        </DialogActions>
      </Dialog>
  </Box>
  </AppShell>
  );
}
