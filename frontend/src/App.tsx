import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container, Box, AppBar, Toolbar, Typography } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { AuthProvider } from '../features/auth/AuthContext';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import Geolocation from '../features/geolocalizzazione/Geolocation';
import ChatAssistant from '../features/chat/ChatAssistant';
import MedicoProfile from '../features/medico/MedicoProfile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppBar position="static" color="primary">
            <Toolbar>
              <Typography variant="h6">Assistente Sanitario</Typography>
            </Toolbar>
          </AppBar>
          <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', backgroundColor: '#f5f5f5', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', mt: 4, p: 4 }}>
            <Box sx={{ my: 4, width: '100%' }}>
              <Routes>
                <Route path="/" element={<ChatAssistant />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/geolocation" element={<Geolocation />} />
                <Route path="/medico" element={<MedicoProfile />} />
              </Routes>
            </Box>
          </Container>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
