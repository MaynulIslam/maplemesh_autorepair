import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Paper, Stack
} from '@mui/material';
import AppShell from '../components/Layout/AppShell';

export default function Billing() {
  const [history,setHistory]=useState([]);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    // Placeholder: fetch billing history later
    setHistory([
      { id:'INV-2025-068', date:'2025-06-15', service:'Oil Change - TOYOTA RAV4', amount:65, status:'Paid' },
      { id:'INV-2025-054', date:'2025-05-22', service:'Tire Rotation - TOYOTA RAV4', amount:45, status:'Paid' },
      { id:'INV-2025-032', date:'2025-04-10', service:'Brake Inspection - TOYOTA RAV4', amount:125, status:'Pending' },
      { id:'INV-2025-018', date:'2025-03-05', service:'Battery Replacement - TOYOTA RAV4', amount:210, status:'Paid' }
    ]);
  },[]);

  const plans = [
    { id:'premium', name:'Premium Maintenance', period:'Annual', price:'$599/year', status:'Active' },
    { id:'roadside', name:'Road-Side Assistance', period:'Monthly', price:'$15/month', status:'-' },
    { id:'warranty', name:'Extended Warranty', period:'3 Years', price:'$1,299', status:'-' }
  ];

  return (
    <AppShell>
      <Typography variant="h5" fontWeight={700} sx={{ mb:3 }}>Billing & Payments</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height:'100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}>Current Balance</Typography>
              <Typography variant="h5" color="primary" fontWeight={700} sx={{ mt:1 }}>$125.00</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display:'block', mt:1 }}>Due on: August 15, 2025</Typography>
              <Button size="small" variant="contained" sx={{ mt:2, bgcolor:'#022E24','&:hover':{ bgcolor:'#034433' }}}>Pay Now</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height:'100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}>Payment Methods</Typography>
              <Typography variant="body2" sx={{ mt:1 }}>Visa ending in 4582</Typography>
              <Typography variant="body2" sx={{ mt:0.5 }}>MasterCard ending in 8724</Typography>
              <Button size="small" variant="outlined" sx={{ mt:2 }}>Add Payment Method</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height:'100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}>Billing Settings</Typography>
              <Stack spacing={1} sx={{ mt:1 }}>
                <Typography variant="body2">Auto-pay enabled</Typography>
                <Typography variant="body2">Email receipts</Typography>
              </Stack>
              <Button size="small" variant="outlined" sx={{ mt:2 }}>Manage Settings</Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Billing History */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ overflow:'hidden' }}>
            <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:2, py:1, bgcolor:'#041B15', color:'#fff' }}>
              <Typography fontWeight={700}>Billing History</Typography>
              <TextField size="small" placeholder="Search invoices..." sx={{ bgcolor:'#fff', borderRadius:1, width:260 }} />
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor:'#041B15' }}>
                  <TableCell sx={{ color:'#fff', fontWeight:600 }}>Invoice #</TableCell>
                  <TableCell sx={{ color:'#fff', fontWeight:600 }}>Date</TableCell>
                  <TableCell sx={{ color:'#fff', fontWeight:600 }}>Service</TableCell>
                  <TableCell sx={{ color:'#fff', fontWeight:600 }}>Amount</TableCell>
                  <TableCell sx={{ color:'#fff', fontWeight:600 }}>Status</TableCell>
                  <TableCell sx={{ color:'#fff', fontWeight:600 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.id}</TableCell>
                    <TableCell>{formatDate(inv.date)}</TableCell>
                    <TableCell>{inv.service}</TableCell>
                    <TableCell>{inv.amount.toLocaleString(undefined,{ style:'currency', currency:'USD' })}</TableCell>
                    <TableCell>{inv.status === 'Pending' ? <Chip size="small" label="Pending" color="warning" /> : <Chip size="small" label="Paid" color="success" />}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined">View</Button>
                        <Button size="small" variant="outlined">PDF</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Plans + Promotions */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ overflow:'hidden' }}>
            <Box sx={{ px:2, py:1, bgcolor:'#041B15', color:'#fff' }}>
              <Typography fontWeight={700}>Service Plans & Subscriptions</Typography>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Plan</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.period}</TableCell>
                    <TableCell>{p.price}</TableCell>
                    <TableCell>{p.status === 'Active' ? <Chip label="Active" size="small" color="success" /> : <Button size="small" variant="outlined">Add Service Plan</Button>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Promo color="#3D82F4" text="SAVE 15% ON ANNUAL SERVICE PLANS! USE CODE: ANNUAL25" />
            <Promo color="#DA9A16" text="SIGN UP FOR AUTO-PAY AND GET $25 CREDIT ON YOUR NEXT SERVICE!" />
          </Stack>
        </Grid>
      </Grid>
    </AppShell>
  );
}

function formatDate(d){
  try { return new Date(d).toLocaleDateString(undefined,{ month:'short', day:'2-digit', year:'numeric' }); } catch { return d; }
}

function Promo({ color, text }){
  return (
    <Card sx={{ bgcolor:color, color:'#fff', p:2 }}>
      <Typography variant="body2" fontWeight={600}>{text}</Typography>
      <Typography variant="caption" sx={{ display:'block', mt:1 }}>*Terms and conditions apply</Typography>
    </Card>
  );
}