import { useState, useEffect } from 'react';
import {
  TextField, Button, Stack, Alert, CircularProgress,
  Paper, Typography, Link, Checkbox, FormControlLabel, Divider, Box, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import AppleIcon from '@mui/icons-material/Apple';
import { useAuthCtx } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const { signIn, user } = useAuthCtx();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');
  const [loading,setLoading]=useState(false);
  const nav = useNavigate();
  const [showChoice,setShowChoice]=useState(false);

  useEffect(()=>{ if (user) nav('/dashboard'); },[user,nav]);

  const submit = async e => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await signIn(email,password);
      nav('/dashboard');
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight:'100vh', bgcolor:'#041B15', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', pt:8, pb:4 }}>
      <Box sx={{ textAlign:'center', mb:4 }}>
        <Typography variant="h3" fontWeight={800} sx={{ color:'#fff', lineHeight:1 }}>MapleMesh</Typography>
        <Typography variant="h5" fontWeight={600} sx={{ color:'#E2F5EE', mt:-0.5 }}>AutoRepair</Typography>
      </Box>
      <Paper elevation={3} sx={{ width:'100%', maxWidth:430, p:5, borderRadius:2 }}>
        <Typography variant="h6" fontWeight={700} textAlign="center" sx={{ mb:1 }}>Sign In</Typography>
        <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mb:3 }}>Enter your credentials to access your account</Typography>
        <form onSubmit={submit} noValidate>
          <Stack spacing={2.2}>
            {err && <Alert severity="error" onClose={()=>setErr('')}>{err}</Alert>}
            <TextField
              label="Email"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              autoComplete="email"
              size="small"
              required
              fullWidth
            />
            <TextField
              label="Password"
              placeholder="Enter your Password"
              type="password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              autoComplete="current-password"
              size="small"
              required
              fullWidth
            />
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt:-1 }}>
              <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="caption">Remember me</Typography>} />
              <Link component="button" variant="caption" sx={{ fontSize:12 }} onClick={()=>alert('Forgot password flow TBD')}>Forgot password?</Link>
            </Stack>
            <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor:'#065f4c', py:1.1, textTransform:'none', fontWeight:600, '&:hover':{ bgcolor:'#044d3d' } }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign in'}
            </Button>
            <Divider><Typography variant="caption" color="text.secondary">Or continue with</Typography></Divider>
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button variant="outlined" fullWidth startIcon={<GoogleIcon />} sx={{ textTransform:'none', bgcolor:'#fff' }}>Google</Button>
              <Button variant="outlined" fullWidth startIcon={<FacebookIcon />} sx={{ textTransform:'none', bgcolor:'#fff' }}>Facebook</Button>
              <Button variant="outlined" fullWidth startIcon={<AppleIcon />} sx={{ textTransform:'none', bgcolor:'#fff' }}>Apple</Button>
            </Stack>
            <Typography variant="body2" textAlign="center" sx={{ mt:1 }}>
              Don't have an account? <Link component="button" onClick={()=>setShowChoice(true)} sx={{ fontWeight:600 }}>Sign up</Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
      <Typography variant="caption" color="#fff" sx={{ mt:5 }}>
        © 2025 MapleMesh AutoRepair. All rights reserved.
      </Typography>

      <Dialog
        open={showChoice}
        onClose={()=>setShowChoice(false)}
        maxWidth="sm"
        fullWidth
        componentsProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0,0,0,0.55)' // darker + blur
            }
          }
        }}
        PaperProps={{ sx:{ borderRadius:3 } }}
      >
        <DialogTitle sx={{ fontWeight:800 }}>Create Your Account</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Paper
              variant="outlined"
              onClick={()=>{ setShowChoice(false); nav('/register/customer'); }}
              sx={{ p:2, cursor:'pointer', display:'flex', flexDirection:'column', gap:.75, transition:'all .25s', borderRadius:2,
                '&:hover':{ borderColor:'#065f4c', boxShadow:'0 0 0 3px rgba(6,95,76,.15)', bgcolor:'#f1fdfa' } }}
            >
              <Typography variant="subtitle1" fontWeight={700}>I want to fix my vehicle</Typography>
              <Typography variant="body2" color="text.secondary">Book services, manage vehicles, track service history.</Typography>
            </Paper>
            <Paper
              variant="outlined"
              onClick={()=>{ setShowChoice(false); nav('/register/technician'); }}
              sx={{ p:2, cursor:'pointer', display:'flex', flexDirection:'column', gap:.75, transition:'all .25s', borderRadius:2,
                '&:hover':{ borderColor:'#065f4c', boxShadow:'0 0 0 3px rgba(6,95,76,.15)', bgcolor:'#f1fdfa' } }}
            >
              <Typography variant="subtitle1" fontWeight={700}>I am a technician</Typography>
              <Typography variant="body2" color="text.secondary">Offer services, manage jobs, build reputation and billing.</Typography>
            </Paper>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}