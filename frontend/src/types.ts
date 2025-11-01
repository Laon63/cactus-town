export interface LoggedInUser {
  id: string;
  name: string;
  publicKey: string;
  encryptedPrivateKey: string;
}

export interface DecryptedMessage {
  id: string;
  treeOwnerId: string;
  encryptedContent: string;
  authorName: string;
  createdAt: string;
  decryptedContent: string; // Added after decryption
}

export interface PublicUser {
  id: string;
  name: string;
}
