import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#041B15' },
    secondary: { main: '#136F63' },
    background: { default: '#f5f9fb', paper: '#ffffff' },
    success: { main: '#72b01d' },
    warning: { main: '#f7b801' },
    error: { main: '#f72585' },
    info: { main: '#4cc9f0' }
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h4: { fontWeight: 600 }
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', borderRadius: 10, fontWeight: 500 } }
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 16 } }
    }
  }
});

export default theme;