import React, { useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { Typography, Box, TextField, Button, Alert, Paper } from '@mui/material';

// Helper function to derive a key from a password (simple example)
const passwordToKey = (password: string): Uint8Array => {
  const salt = new Uint8Array(16); // In a real app, use a unique, stored salt per user
  const passwordBytes = naclUtil.decodeUTF8(password);
  return nacl.hash(passwordBytes).slice(0, 32);
};

function ActivationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleActivate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      const keyPair = nacl.box.keyPair();
      const publicKey = naclUtil.encodeBase64(keyPair.publicKey);
      const secretKey = keyPair.secretKey;

      const passwordDerivedKey = passwordToKey(password);
      const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
      const encryptedSecretKey = nacl.secretbox(secretKey, nonce, passwordDerivedKey);

      const fullEncryptedKey = new Uint8Array(nonce.length + encryptedSecretKey.length);
      fullEncryptedKey.set(nonce);
      fullEncryptedKey.set(encryptedSecretKey, nonce.length);
      const encryptedPrivateKey = naclUtil.encodeBase64(fullEncryptedKey);

      const response = await fetch('http://localhost:3001/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          password, 
          publicKey, 
          encryptedPrivateKey 
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Activation failed');
      }

      setSuccess('Account activated successfully! You can now log in.');
      setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        Account Activation
      </Typography>
      <Typography variant="body1" paragraph>
        Create a password to activate your account.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {!success && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleActivate} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              type="password"
              label="Password (min 8 characters)"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            <TextField
              type="password"
              label="Confirm Password"
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary">
              Activate Account
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default ActivationPage;