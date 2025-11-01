import React, { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

function PublicTreePage() {
  const { userId } = useParams<{ userId: string }>();
  const [ownerPublicKey, setOwnerPublicKey] = useState<Uint8Array | null>(null);
  const [message, setMessage] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const fetchPublicKey = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/users/${userId}/key`);
        if (!response.ok) throw new Error('Could not find this user\'s tree.');
        const data = await response.json();
        setOwnerPublicKey(naclUtil.decodeBase64(data.publicKey));
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      }
    };
    if (userId) {
      fetchPublicKey();
    }
  }, [userId]);

  const handlePostMessage = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!ownerPublicKey) {
      setError('Cannot post message: public key not loaded.');
      return;
    }

    try {
      const messageBytes = naclUtil.decodeUTF8(message);
      const encryptedContent = nacl.box.seal(messageBytes, ownerPublicKey);
      const encryptedContentBase64 = naclUtil.encodeBase64(encryptedContent);

      const response = await fetch(`http://localhost:3001/api/trees/${userId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encryptedContent: encryptedContentBase64,
          authorName: authorName || 'Anonymous'
        }),
      });

      if (!response.ok) throw new Error('Failed to post message.');

      setSuccess('Message posted successfully!');
      setMessage('');
      setAuthorName('');

    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!ownerPublicKey) {
    return <p>Loading tree...</p>;
  }

  return (
    <div>
      <h2>Leave a Message</h2>
      <p>This message will be encrypted and only the tree owner can read it.</p>
      
      <form onSubmit={handlePostMessage}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message here..."
          rows={6}
          required
        ></textarea><br />
        <input 
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name (optional)"
        /><br />
        <button type="submit">Post Encrypted Message</button>
      </form>

      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}

export default PublicTreePage;