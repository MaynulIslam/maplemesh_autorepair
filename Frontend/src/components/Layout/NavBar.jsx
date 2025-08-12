import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useAuthCtx } from '../../context/AuthContext';

export default function NavBar() {
  const { user, signOut } = useAuthCtx();
  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(135deg,#041B15,#0B3C30)' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>MapleMesh AutoRepair</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {user && <Typography variant="body2">{user.email}</Typography>}
          {user && <Button color="inherit" onClick={signOut}>Logout</Button>}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}