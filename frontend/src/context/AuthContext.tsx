import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { LoggedInUser } from '../types';

// --- Helper (should be identical in ActivationPage) ---
const passwordToKey = (password: string): Uint8Array => {
  const salt = new Uint8Array(16);
  const passwordBytes = naclUtil.decodeUTF8(password);
  return nacl.hash(passwordBytes).slice(0, 32);
};

// --- Context Type Definition ---
interface AuthContextType {
  user: LoggedInUser | null;
  token: string | null;
  decryptedSecretKey: Uint8Array | null;
  login: (name: string, password: string) => Promise<void>;
  logout: () => void;
}

// --- Context Creation ---
const AuthContext = createContext<AuthContextType | null>(null);

// --- Provider Component ---
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [decryptedSecretKey, setDecryptedSecretKey] = useState<Uint8Array | null>(null);
  const navigate = useNavigate();

  const login = async (name: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const passwordDerivedKey = passwordToKey(password);
      const fullEncryptedKey = naclUtil.decodeBase64(data.user.encryptedPrivateKey);
      const nonce = fullEncryptedKey.slice(0, nacl.secretbox.nonceLength);
      const encryptedSecretKey = fullEncryptedKey.slice(nacl.secretbox.nonceLength);

      const decryptedKey = nacl.secretbox.open(encryptedSecretKey, nonce, passwordDerivedKey);
      if (!decryptedKey) {
        throw new Error('Failed to decrypt private key. Incorrect password?');
      }

      setToken(data.token);
      setUser(data.user);
      setDecryptedSecretKey(decryptedKey);

      navigate(`/guestbook/${data.user.id}`);

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setDecryptedSecretKey(null);
    navigate('/login');
  };

  const value = { user, token, decryptedSecretKey, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Custom Hook ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};