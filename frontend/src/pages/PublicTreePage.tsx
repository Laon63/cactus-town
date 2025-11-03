import React, { useState, useEffect, FormEvent } from "react";
import { useParams } from "react-router-dom";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import { Typography, Box, TextField, Button, Alert, Paper, CircularProgress } from "@mui/material";

function PublicTreePage() {
  const { userId } = useParams<{ userId: string }>();
  const [ownerPublicKey, setOwnerPublicKey] = useState<Uint8Array | null>(null);
  const [message, setMessage] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPublicKey = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/users/${userId}/key`);
        if (!response.ok) throw new Error("Could not find this user's tree.");
        const data = await response.json();
        setOwnerPublicKey(naclUtil.decodeBase64(data.publicKey));
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchPublicKey();
    }
  }, [userId]);

  const handlePostMessage = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!ownerPublicKey) {
      setError("Cannot post message: public key not loaded.");
      return;
    }

    try {
      const ephemeralKeyPair = nacl.box.keyPair();
      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      const messageBytes = naclUtil.decodeUTF8(message);
      const encryptedMessage = nacl.box(
        messageBytes,
        nonce,
        ownerPublicKey,
        ephemeralKeyPair.secretKey
      );

      const fullPayload = new Uint8Array(ephemeralKeyPair.publicKey.length + nonce.length + encryptedMessage.length);
      fullPayload.set(ephemeralKeyPair.publicKey);
      fullPayload.set(nonce, ephemeralKeyPair.publicKey.length);
      fullPayload.set(encryptedMessage, ephemeralKeyPair.publicKey.length + nonce.length);

      const encryptedContentBase64 = naclUtil.encodeBase64(fullPayload);

      const response = await fetch(`http://localhost:3001/api/trees/${userId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encryptedContent: encryptedContentBase64,
          authorName: authorName || "Anonymous"
        }),
      });

      if (!response.ok) throw new Error("Failed to post message.");

      setSuccess("Message posted successfully!");
      setMessage("");
      setAuthorName("");

    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  if (!ownerPublicKey) {
    return <Alert severity="warning" sx={{ mt: 2 }}>User not found or public key not available.</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        Leave a Message
      </Typography>
      <Typography variant="body1" paragraph>
        This message will be encrypted and only the tree owner can read it.
      </Typography>
      
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box component="form" onSubmit={handlePostMessage} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Your Message"
            multiline
            rows={6}
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here..."
            required
            fullWidth
          />
          <TextField 
            label="Your Name (optional)"
            variant="outlined"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary">
            Post Encrypted Message
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default PublicTreePage;
