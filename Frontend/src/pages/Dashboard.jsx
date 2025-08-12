import { useEffect, useState } from 'react';
import { Typography, Grid, Card, CardContent, Skeleton } from '@mui/material';
import AppShell from '../components/Layout/AppShell';
import { listVehicles } from '../api/vehicles';

export default function Dashboard() {
  const [vehicles,setVehicles]=useState(null);
  useEffect(()=>{
    listVehicles().then(v=>setVehicles(v)).catch(()=>setVehicles([]));
  },[]);
  return (
    <AppShell>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        {(vehicles === null ? Array.from({length:3}) : vehicles).map((v,i)=>(
          <Grid item xs={12} md={4} key={i}>
            <Card variant="outlined" sx={{ height:'100%' }}>
              <CardContent>
                {vehicles === null ? (
                  <>
                    <Skeleton width="60%" />
                    <Skeleton width="40%" />
                    <Skeleton width="80%" />
                  </>
                ) : (
                  <>
                    <Typography variant="h6">{v.year} {v.make} {v.model}</Typography>
                    <Typography variant="body2" color="text.secondary">{v.license_plate || 'No plate'}</Typography>
                    <Typography variant="body2" color="text.secondary">{v.color || 'Color N/A'}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </AppShell>
  );
}