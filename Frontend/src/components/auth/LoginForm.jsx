import { useState, useEffect } from 'react';
import {
  TextField, Button, Stack, Alert, CircularProgress,
  Paper, Typography, Link
} from '@mui/material';
import { useAuthCtx } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const { signIn, user } = useAuthCtx();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');
  const [loading,setLoading]=useState(false);
  const nav = useNavigate();

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
    <Stack alignItems="center" sx={{ mt: 10, px:2 }}>
      <Paper elevation={5} sx={{
        p:5, width:'100%', maxWidth:420,
        background: 'linear-gradient(165deg,#FFFFFF,#F4FAFA)'
      }}>
        <Typography variant="h5" fontWeight={600} mb={1}>Sign In</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Access your garage, services and more.
        </Typography>
        <form onSubmit={submit}>
          <Stack spacing={2}>
            {err && <Alert severity="error">{err}</Alert>}
            <TextField label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required size="small" />
            <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required size="small" />
            <Button variant="contained" type="submit" disabled={loading}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
            </Button>
            <Typography variant="caption" textAlign="center">
              No account? <Link component="button" onClick={()=>nav('/register')}>Create one</Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}