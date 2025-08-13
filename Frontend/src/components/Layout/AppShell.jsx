import { useAuthCtx } from '../../context/AuthContext';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import React, { useState, useRef } from 'react';
import {
  AppBar, Toolbar, Typography, Box, Button, Stack, Menu, MenuItem, Divider
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { styled, alpha } from '@mui/material/styles';

// Brand (two line)
const Brand = styled('div')(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1rem',
  lineHeight: 1.05,
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  letterSpacing: '.5px'
}));

const NavLinkButton = styled(Button)(({ theme }) => ({
  color: '#fff',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '.9rem',
  letterSpacing: '.4px',
  paddingInline: 16,
  borderRadius: 0,
  position: 'relative',
  height: '100%',
  '&.active': { fontWeight: 600, background: alpha('#ffffff',0.12) },
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 3,
    height: 3,
    borderRadius: 2,
    background: alpha('#fff',0),
    transition: 'background .25s'
  },
  '&.active::after': { background: '#fff' },
  '&:hover': { background: alpha('#ffffff',0.08) },
  '&:hover::after': { background: alpha('#fff',.35) }
}));

export default function AppShell({ children }) {
  const { user, signOut } = useAuthCtx();
  const nav = useNavigate();
  const loc = useLocation();
  const [menuOpen,setMenuOpen] = useState(false);
  const anchorRef = useRef(null);

  const firstName = (user?.first_name?.trim()) || (user?.email ? user.email.split('@')[0] : 'User');

  const toggleMenu = () => setMenuOpen(o=>!o);
  const closeMenu = () => setMenuOpen(false);

  const navItems = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Service', to: '/services' },
    { label: 'Billing', to: '/billing' }
  ];

  return (
    <Box sx={{ minHeight:'100vh', bgcolor:'#f2f7fd', display:'flex', flexDirection:'column' }}>
  <AppBar position="fixed" elevation={0} square sx={{ background:'#04221A', borderRadius:0 }}>
        <Toolbar disableGutters sx={{ px:3, minHeight:70, display:'flex', alignItems:'stretch' }}>
          {/* Left Section */}
          <Box sx={{ display:'flex', alignItems:'center', gap:4 }}>
            <Brand>
              <Box onClick={()=>nav('/dashboard')} sx={{ cursor:'pointer', display:'flex', flexDirection:'column', px:1.5, py:1, ml:-1.5, '&:hover':{ background: alpha('#ffffff',0.08) } }}>
                <span>MapleMesh</span>
                <span style={{ fontWeight:400 }}>AutoRepair</span>
              </Box>
            </Brand>
            <Stack direction="row" spacing={0}>
              {navItems.map(item => (
                <NavLink key={item.to} to={item.to} style={{ textDecoration:'none' }} end={item.to==='/dashboard'}>
                  {({ isActive }) => (
                    <NavLinkButton size="small" className={isActive ? 'active' : ''}>{item.label}</NavLinkButton>
                  )}
                </NavLink>
              ))}
            </Stack>
          </Box>
          {/* Center Tagline */}
          <Box sx={{ flexGrow:1, textAlign:'center', display:'flex', flexDirection:'column', justifyContent:'center', pointerEvents:'none' }}>
            <Typography variant="h6" sx={{ fontWeight:700, color:'#fff', lineHeight:1.1 }}>Welcome Back!</Typography>
            <Typography variant="caption" sx={{ color:'#E2F5EE', letterSpacing:.5 }}>Your Trusted Online Auto Service Partner</Typography>
          </Box>
          {/* Right User Menu */}
          <Box sx={{ display:'flex', alignItems:'center' }}>
            {user && (
              <Box sx={{ display:'flex', alignItems:'center' }}>
                <NavLinkButton
                  onClick={()=> nav('/profile')}
                  size="small"
                  className={loc.pathname==='/profile' ? 'active' : ''}
                >
                  {firstName}
                </NavLinkButton>
                <Button
                  ref={anchorRef}
                  onClick={toggleMenu}
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? 'true' : undefined}
                  sx={{
                    minWidth:40, px:1, borderRadius:0, height:'100%', color:'#fff', fontWeight:500, fontSize:'.9rem', letterSpacing:'.4px',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    '&:hover':{ background: alpha('#ffffff',0.08) },
                    '& .arrow':{ transition:'transform .25s' },
                    ...(menuOpen && { '& .arrow':{ transform:'rotate(180deg)' } })
                  }}
                >
                  <KeyboardArrowDownIcon className="arrow" fontSize="small" />
                </Button>
                <Menu
                  anchorEl={anchorRef.current}
                  open={menuOpen}
                  onClose={closeMenu}
                  MenuListProps={{ dense:true }}
                  anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
                  transformOrigin={{ vertical:'top', horizontal:'right' }}
                  slotProps={{ paper:{ sx:{ mt:1 } } }}
                >
                  <MenuItem onClick={()=>{ closeMenu(); nav('/help'); }}>
                    <HelpOutlineIcon fontSize="small" style={{ marginRight:8 }} /> Help & Support
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={()=>{ closeMenu(); signOut(); nav('/login'); }}>
                    <LogoutIcon fontSize="small" style={{ marginRight:8 }} /> Sign Out
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar sx={{ minHeight:70 }} />
      <Box sx={{ flexGrow:1, py:4 }}>
        <Box sx={{ maxWidth:1400, mx:'auto', px:{ xs:2, md:4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}