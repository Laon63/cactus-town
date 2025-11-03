import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { DecryptedMessage } from '../types';
import { Typography, Box, Button, Alert, Paper, CircularProgress } from '@mui/material';

function GuestbookPage() {
  const { user, token, decryptedSecretKey, logout } = useAuth();
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!token || !user || !decryptedSecretKey) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/guestbook/messages', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch messages.');
        
        const encryptedMessages: any[] = await response.json();
        
        const ownerPublicKey = naclUtil.decodeBase64(user.publicKey);

        const decrypted = encryptedMessages.map((msg): DecryptedMessage => {
          try {
            const fullPayload = naclUtil.decodeBase64(msg.encryptedContent);

            const ephemeralPublicKey = fullPayload.slice(0, nacl.box.publicKeyLength);
            const nonce = fullPayload.slice(nacl.box.publicKeyLength, nacl.box.publicKeyLength + nacl.box.nonceLength);
            const encryptedContentBytes = fullPayload.slice(nacl.box.publicKeyLength + nacl.box.nonceLength);

            const decryptedContentBytes = nacl.box.open(
              encryptedContentBytes,
              nonce,
              ephemeralPublicKey,
              decryptedSecretKey
            );

            if (!decryptedContentBytes) throw new Error('Decryption failed');
            const decryptedContent = naclUtil.encodeUTF8(decryptedContentBytes);
            return { ...msg, decryptedContent };
          } catch (e) {
            console.error('Failed to decrypt a message:', e);
            return { ...msg, decryptedContent: '[Could not decrypt this message]' };
          }
        });

        setMessages(decrypted);

      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [token, user, decryptedSecretKey]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h2">
          {user ? `${user.name}'s Guestbook` : 'Guestbook'}
        </Typography>
        <Button variant="outlined" color="secondary" onClick={logout}>
          Logout
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Box>
          <Typography variant="h5" component="h3" gutterBottom>
            Messages for you:
          </Typography>
          {messages.length === 0 && <Typography variant="body1">No messages yet.</Typography>}
          {messages.map(msg => (
            <Paper key={msg.id} elevation={2} sx={{ p: 2, mb: 2 }}>
              <Typography variant="body1" paragraph>
                {msg.decryptedContent}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                From: {msg.authorName} on {new Date(msg.createdAt).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default GuestbookPage;