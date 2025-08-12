import { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Drawer, AppBar as MuiAppBar, Toolbar, List, CssBaseline, Typography, Divider,
  IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Avatar, Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, Build, ReceiptLong, Person, Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthCtx } from '../../context/AuthContext';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, { shouldForwardProp: p => p !== 'open' })(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width','margin']),
  ...(open && { marginLeft: drawerWidth, width: `calc(100% - ${drawerWidth}px)` })
}));

const DrawerStyled = styled(Drawer, { shouldForwardProp: p => p !== 'open' })(({ open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: 'width .25s',
    boxSizing: 'border-box',
    ...(!open && { overflowX: 'hidden', width: 70 })
  }
}));

export default function AppShell({ children }) {
  const [open, setOpen] = useState(true);
  const nav = useNavigate();
  const loc = useLocation();
  const { user, signOut } = useAuthCtx();

  const items = [
    { label: 'Dashboard', icon: <Dashboard />, to: '/dashboard' },
    { label: 'Services', icon: <Build />, to: '/services' },
    { label: 'Billing', icon: <ReceiptLong />, to: '/billing' },
    { label: 'Profile', icon: <Person />, to: '/profile' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} color="primary" sx={{ background: 'linear-gradient(135deg,#041B15,#0A3A2D)' }}>
        <Toolbar sx={{ gap: 2 }}>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(o=>!o)}>
            <MenuIcon />
          </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
              MapleMesh AutoRepair
            </Typography>
            {user && (
              <Tooltip title={user.email}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  {user.email?.[0]?.toUpperCase()}
                </Avatar>
              </Tooltip>
            )}
        </Toolbar>
      </AppBar>
      <DrawerStyled variant="permanent" open={open}>
        <Toolbar />
        <Divider />
        <List sx={{ flexGrow: 1 }}>
          {items.map(i => (
            <ListItem key={i.to} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                selected={loc.pathname === i.to}
                onClick={() => nav(i.to)}
                sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', color: 'primary.main' }}>
                  {i.icon}
                </ListItemIcon>
                <ListItemText primary={i.label} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton onClick={() => { signOut(); nav('/login'); }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </DrawerStyled>
      <Box component="main" sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <Toolbar />
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}