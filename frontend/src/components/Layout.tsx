import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Breadcrumb from './Breadcrumb';
import { Box, Container } from '@mui/material';

function Layout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Breadcrumb />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default Layout;