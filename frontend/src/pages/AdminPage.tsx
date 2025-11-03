import React, { useState, FormEvent } from "react";
import { Typography, Box, TextField, Button, Alert, List, ListItem, ListItemText, Paper } from "@mui/material";

interface CreatedGroup {
  id: string;
  name: string;
}

interface ActivationLink {
  name: string;
  link: string;
}

function AdminPage() {
  const [groupName, setGroupName] = useState<string>("");
  const [createdGroup, setCreatedGroup] = useState<CreatedGroup | null>(null);
  
  const [memberNames, setMemberNames] = useState<string>("");
  const [activationLinks, setActivationLinks] = useState<ActivationLink[]>([]);
  const [error, setError] = useState<string>("");

  const handleCreateGroup = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("http://localhost:3001/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName }),
      });
      if (!response.ok) throw new Error("Group creation failed");
      const group: CreatedGroup = await response.json();
      setCreatedGroup(group);
      setGroupName(""); // Clear input after creation
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleAddMembers = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!createdGroup) {
      setError("Create a group first.");
      return;
    }
    try {
      const names = memberNames.split("\n").filter(name => name.trim() !== "");
      if (names.length === 0) {
        setError("Please enter at least one member name.");
        return;
      }
      const response = await fetch(`http://localhost:3001/api/groups/${createdGroup.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names }),
      });
      if (!response.ok) throw new Error("Adding members failed");
      const links: ActivationLink[] = await response.json();
      setActivationLinks(links);
      setMemberNames(""); // Clear input after adding members
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        Group & Member Management
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!createdGroup ? (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" component="h3" gutterBottom>
            1. Create a Group
          </Typography>
          <Box component="form" onSubmit={handleCreateGroup} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Group Name"
              variant="outlined"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary">
              Create Group
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" component="h3" gutterBottom>
            Group '{createdGroup.name}' Created!
          </Typography>
          <Typography variant="h5" component="h3" gutterBottom>
            2. Add Members
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter one member name per line.
          </Typography>
          <Box component="form" onSubmit={handleAddMembers} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Member Names"
              multiline
              rows={5}
              variant="outlined"
              value={memberNames}
              onChange={(e) => setMemberNames(e.target.value)}
              placeholder="Alice\nBob\nCharlie"
              required
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary">
              Add Members & Generate Links
            </Button>
          </Box>
        </Paper>
      )}

      {activationLinks.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" component="h3" gutterBottom>
            3. Share Activation Links
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Copy these links and send them to the respective members.
          </Typography>
          <List>
            {activationLinks.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemText 
                  primary={<strong>{item.name}:</strong>}
                  secondary={
                    <TextField
                      value={item.link}
                      fullWidth
                      variant="outlined"
                      size="small"
                      InputProps={{ readOnly: true }}
                      sx={{ mt: 1 }}
                    />
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}

export default AdminPage;