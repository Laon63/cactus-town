import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Container, TextField, Typography, List, ListItem, ListItemText, Paper } from "@mui/material";

import { Cactus, Message } from "../types";

function CactusPage() {
  const { cactusId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch cactus and messages from localStorage
  const cacti: Cactus[] = JSON.parse(localStorage.getItem("cacti") || "[]");
  const cactus = cacti.find((c) => c.id === cactusId);

  useEffect(() => {
    const allMessages: Message[] = JSON.parse(localStorage.getItem("messages") || "[]");
    const cactusMessages = allMessages.filter((m) => m.cactusId === cactusId);
    setMessages(cactusMessages);
  }, [cactusId]);

  const handleAddMessage = () => {
    if (!newMessage.trim()) {
      alert("Please enter a message.");
      return;
    }

    const newMsg = { id: Date.now(), text: newMessage, cactusId };
    const allMessages = JSON.parse(localStorage.getItem("messages") || "[]");
    allMessages.push(newMsg);
    localStorage.setItem("messages", JSON.stringify(allMessages));

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  if (!cactus) {
    return (
      <Container maxWidth="sm" sx={{ my: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cactus not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {cactus.name}'s Cactus
      </Typography>

      <Box component={Paper} sx={{ p: 2, my: 2 }}>
        <Typography variant="h6">Messages:</Typography>
        {messages.length > 0 ? (
          <List>
            {messages.map((msg) => (
              <ListItem key={msg.id}>
                <ListItemText primary={msg.text} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography sx={{ my: 2 }}>No messages yet. Be the first to leave one!</Typography>
        )}
      </Box>

      <Box component="form" sx={{ mt: 4 }}>
        <TextField
          label="Leave a message"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddMessage} sx={{ mt: 2 }}>
          Post Message
        </Button>
      </Box>
    </Container>
  );
}

export default CactusPage;
