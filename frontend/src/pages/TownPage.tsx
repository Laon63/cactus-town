import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography, List, ListItem, ListItemText } from '@mui/material';

function TownPage() {
  const { townId } = useParams();
  const [open, setOpen] = useState(false);
  const [cactusName, setCactusName] = useState('');
  const [cacti, setCacti] = useState<any[]>([]);

  // In a real app, you'd fetch the town data from an API.
  // For now, we'll get it from localStorage.
  const towns = JSON.parse(localStorage.getItem('towns') || '[]');
  const town = towns.find((t: any) => t.id === townId);

  useEffect(() => {
    const allCacti = JSON.parse(localStorage.getItem('cacti') || '[]');
    const townCacti = allCacti.filter((c: any) => c.townId === townId);
    setCacti(townCacti);
  }, [townId]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreateCactus = () => {
    if (!cactusName.trim()) {
      alert('Please enter a name for your cactus.');
      return;
    }

    // Create a new user/cactus
    const newCactusId = Math.random().toString(36).substring(2, 9);
    const newCactus = { id: newCactusId, name: cactusName, townId };

    // Store the new cactus in localStorage
    const allCacti = JSON.parse(localStorage.getItem('cacti') || '[]');
    allCacti.push(newCactus);
    localStorage.setItem('cacti', JSON.stringify(allCacti));

    // For this demo, we'll also log the user in by storing their ID
    localStorage.setItem('userId', newCactusId);

    handleClose();
    // We would then likely refresh the page or update the state to show the new cactus
    window.location.reload();
  };

  if (!town) {
    return (
      <Container maxWidth="sm" sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Town not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to {town.name}
      </Typography>
      <Typography variant="h6" component="h2" gutterBottom>
        Cacti in this town:
      </Typography>
      
      {cacti.length > 0 ? (
        <List>
          {cacti.map((cactus) => (
            <ListItem key={cactus.id} component={Link} to={`/cactus/${cactus.id}`}>
              <ListItemText primary={cactus.name} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ my: 2 }}>
          <Typography>No cacti here yet. Be the first to create one!</Typography>
        </Box>
      )}

      <Button variant="contained" onClick={handleClickOpen}>Create Your Cactus</Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create Your Cactus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Give your cactus a name. This will be your identity in this town.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Cactus Name"
            type="text"
            fullWidth
            variant="standard"
            value={cactusName}
            onChange={(e) => setCactusName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateCactus}>Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TownPage;
