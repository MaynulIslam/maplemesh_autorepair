import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import NavBar from './NavBar';

export default function AppLayout({ children }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f7ff', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <Container sx={{ py: 4, flexGrow: 1 }}>
        {children}
      </Container>
    </Box>
  );
}