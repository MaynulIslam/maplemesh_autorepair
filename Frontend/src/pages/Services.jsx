import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Grid, Paper, Button, Stack, Chip, Table, TableBody, TableCell, TableHead, TableRow, TextField, LinearProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { fetchCustomerServices, fetchServiceCatalog, createCustomerService } from '../api/services';
import AppShell from '../components/Layout/AppShell';

export default function Services(){
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(()=>{
    let active=true;
    (async ()=>{
      setLoading(true); setError(null);
      try {
        const [svc, cat] = await Promise.all([
          fetchCustomerServices(),
            fetchServiceCatalog()
        ]);
        if(!active) return;
        setServices(svc);
        setCatalog(cat);
      } catch(e){
        console.error(e);
        active && setError('Failed to load services.');
      } finally { active && setLoading(false); }
    })();
    return ()=>{ active=false; };
  },[]);

  const filtered = useMemo(()=> services.filter(s=>{
    if(!search.trim()) return true;
    return (s.services||[]).some(id=> id.toLowerCase().includes(search.toLowerCase())) ||
           (s.status||'').toLowerCase().includes(search.toLowerCase());
  }), [services, search]);

  function formatDate(d){
    try { return new Date(d).toLocaleDateString(undefined,{ month:'short', day:'numeric', year:'numeric'}); } catch{ return '-'; }
  }

  const recommended = useMemo(()=>[
    { name:'Cabin Air Filter Replacement', date:'August 2025' },
    { name:'Brake Fluid Flush', date:'September 2025' },
    { name:'Battery Check', date:'October 2025' }
  ],[]);

  return (
    <AppShell>
    <Box sx={{ px:2, py:1 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb:3, letterSpacing:.5 }}>Service Management</Typography>

      {loading && <LinearProgress sx={{ mb:2 }} />}
      {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p:0, mb:3, display:'flex', flexDirection:'column' }} elevation={1}>
            <Box sx={{ px:3, pt:3 }}>
              <Button variant="contained" size="small" disableElevation sx={{ background:'#04221A', '&:hover':{ background:'#063428' }, textTransform:'none', fontWeight:600, borderRadius:1, boxShadow:'none' }}>Your Services</Button>
              <Box sx={{ mt:2, minHeight:64 }}>
                {error && <Typography variant="body2" color="error">Failed to load services.</Typography>}
                {!error && services.length===0 && !loading && <Typography variant="body2" color="text.secondary">No active services.</Typography>}
                {!error && services.length>0 && <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {services[0].services.slice(0,6).map(svc => <Chip key={svc} size="small" label={svc} />)}
                </Stack>}
              </Box>
            </Box>
            <Box sx={{ px:3, pb:2, pt:1, display:'flex', justifyContent:'flex-end', gap:1 }}>
              <Button variant="outlined" size="small" startIcon={<EditIcon />} sx={{ textTransform:'none', borderRadius:1 }}>Edit Service</Button>
              <Button variant="contained" size="small" startIcon={<AddIcon />} sx={{ textTransform:'none', fontWeight:600, background:'#04221A', '&:hover':{ background:'#063428' }, borderRadius:1 }}>Add Service</Button>
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
                    <TableCell>ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {error && (
                    <TableRow><TableCell colSpan={5}><Typography variant="body2" color="error">Failed to load services</Typography></TableCell></TableRow>
                  )}
                  {!error && filtered.length===0 && !loading && (
                    <TableRow><TableCell colSpan={5}><Typography variant="body2" color="text.secondary">No matching services.</Typography></TableCell></TableRow>
                  )}
                  {!error && filtered.map(s=> (
                    <TableRow key={s.id} hover>
                      <TableCell>{formatDate(s.created_at)}</TableCell>
                      <TableCell>{(s.services||[]).slice(0,1).join(', ')}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{s.status}</TableCell>
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
  </Box>
  </AppShell>
  );
}
