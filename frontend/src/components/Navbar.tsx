import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <AppBar position="static" sx={{ bgcolor: '#333' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button component={RouterLink} to="/" color="inherit" sx={{ fontWeight: 'bold' }}>
            Home
          </Button>
          <Typography variant="h6" component="div" sx={{ fontSize: '1.25rem' }}>
            Cactus Town Guestbook
          </Typography>
        </Box>
        <Box>
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" color="inherit">
                Welcome, {user.name}
              </Typography>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </Box>
          ) : (
            <Button component={RouterLink} to="/login" color="inherit">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;