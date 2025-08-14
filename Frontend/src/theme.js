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
    },
    // Apply a blurred backdrop to all popups (Dialogs/Modals)
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          backgroundColor: 'rgba(245, 249, 251, 0.5)'
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '::placeholder': {
            fontWeight: 600,
            opacity: 1
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          transition: 'border-color 0.15s, box-shadow 0.15s',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#136F63',
            boxShadow: '0 0 0 2px rgba(19,111,99,0.15)'
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#041B15',
            boxShadow: '0 0 0 2px rgba(4,27,21,0.2)'
          }
        }
      }
    }
  }
});

export default theme;