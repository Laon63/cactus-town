import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography } from '@mui/material';

function CreateTownPage() {
  const [townName, setTownName] = useState('');
  const navigate = useNavigate();

  const handleCreateTown = () => {
    // Basic validation
    if (!townName.trim()) {
      alert('Please enter a town name.');
      return;
    }

    // In a real app, you'd call an API to create the town and get a unique ID.
    // For now, we'll simulate it by creating a random ID.
    const newTownId = Math.random().toString(36).substring(2, 9);

    // We can store the new town in localStorage for this demo
    const towns = JSON.parse(localStorage.getItem('towns') || '[]');
    towns.push({ id: newTownId, name: townName });
    localStorage.setItem('towns', JSON.stringify(towns));

    // Redirect to the new town page
    navigate(`/town/${newTownId}`);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create a New Town
        </Typography>
        <TextField
          label="Town Name"
          variant="outlined"
          fullWidth
          value={townName}
          onChange={(e) => setTownName(e.target.value)}
          sx={{ my: 2 }}
        />
        <Button variant="contained" size="large" onClick={handleCreateTown}>
          Create Town and Get Link
        </Button>
      </Box>
    </Container>
  );
}

export default CreateTownPage;
