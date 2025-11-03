import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Box, List, ListItem, ListItemText, Alert, Link } from '@mui/material';
import { PublicUser } from '../types';

function HomePage() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/users');
        if (!response.ok) throw new Error('Failed to fetch users.');
        const data: PublicUser[] = await response.json();
        setUsers(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      }
    };
    fetchUsers();
  }, []);

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        Welcome to Cactus Town!
      </Typography>
      <Typography variant="body1" paragraph>
        What would you like to do?
      </Typography>
      <Box component="nav" sx={{ mb: 4 }}>
        <List>
          <ListItem disablePadding>
            <Link component={RouterLink} to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItemText primary="Create a new group and invite members" />
            </Link>
          </ListItem>
          <ListItem disablePadding>
            <Link component={RouterLink} to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItemText primary="Login to view your guestbook" />
            </Link>
          </ListItem>
        </List>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {users.length > 0 && (
        <Box>
          <Typography variant="h5" component="h3" gutterBottom>
            Visit a Tree:
          </Typography>
          <List>
            {users.map(user => (
              <ListItem key={user.id} disablePadding>
                <Link component={RouterLink} to={`/tree/${user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <ListItemText primary={`${user.name}'s Tree`} />
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}

export default HomePage;