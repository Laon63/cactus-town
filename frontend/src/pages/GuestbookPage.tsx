import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { DecryptedMessage } from '../types';

function GuestbookPage() {
  const { user, token, decryptedSecretKey, logout } = useAuth();
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMessages = async () => {
      if (!token || !user || !decryptedSecretKey) return;

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
            const encryptedContentBytes = naclUtil.decodeBase64(msg.encryptedContent);
            const decryptedContentBytes = nacl.box.seal.open(encryptedContentBytes, ownerPublicKey, decryptedSecretKey);
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
      }
    };

    fetchMessages();
  }, [token, user, decryptedSecretKey]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{user ? `${user.name}'s Guestbook` : 'Guestbook'}</h2>
        <button onClick={logout}>Logout</button>
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <h3>Messages for you:</h3>
        {messages.length === 0 && <p>No messages yet.</p>}
        {messages.map(msg => (
          <div key={msg.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <p>{msg.decryptedContent}</p>
            <small>From: {msg.authorName} on {new Date(msg.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GuestbookPage;
