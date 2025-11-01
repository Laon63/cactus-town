import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// --- TYPE DEFINITIONS ---
interface User {
  id: string;
  name: string;
  groupId: string;
  activationToken: string | null;
  is_activated: boolean;
  publicKey: string | null;
  encryptedPrivateKey: string | null;
  passwordHash?: string;
}

interface Group {
  id: string;
  name: string;
}

interface Message {
  id: string;
  treeOwnerId: string;
  encryptedContent: string;
  authorName: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  groups: Group[];
  messages: Message[];
}

// Extend Express Request type to include the user from JWT
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

// --- INITIALIZATION ---
const app = express();
const port = 3001;
const JWT_SECRET = 'your-super-secret-key-change-this';
const saltRounds = 10;

const adapter = new JSONFile<DatabaseSchema>('../db.json');
const db = new Low<DatabaseSchema>(adapter);

async function initializeDb() {
  await db.read();
  db.data = db.data || { users: [], groups: [], messages: [] };
  await db.write();
}

initializeDb();

app.use(cors());
app.use(express.json());

// --- API ENDPOINTS ---

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Backend is running!');
});

// Create a new group
app.post('/api/groups', async (req: Request, res: Response) => {
  await db.read();
  if (!db.data) return res.status(500).send({ message: "Database not initialized" });
  const newGroup: Group = {
    id: nanoid(),
    name: req.body.name
  };
  db.data.groups.push(newGroup);
  await db.write();
  res.status(201).send(newGroup);
});

// Register members in a group
app.post('/api/groups/:groupId/members', async (req: Request, res: Response) => {
  const { names } = req.body as { names: string[] };
  const { groupId } = req.params;

  await db.read();
  if (!db.data) return res.status(500).send({ message: "Database not initialized" });
  const group = db.data.groups.find(g => g.id === groupId);
  if (!group) {
    return res.status(404).send({ message: "Group not found" });
  }

  const newUsers: User[] = names.map(name => ({
    id: nanoid(),
    name: name,
    groupId: groupId,
    activationToken: nanoid(32),
    is_activated: false,
    publicKey: null,
    encryptedPrivateKey: null,
  }));

  db.data.users.push(...newUsers);
  await db.write();

  const activationLinks = newUsers.map(user => ({
    name: user.name,
    link: `http://localhost:5173/activate/${user.activationToken}`
  }));

  res.status(201).send(activationLinks);
});

// Activate a user account
app.post('/api/activate', async (req: Request, res: Response) => {
  const { token, password, publicKey, encryptedPrivateKey } = req.body;

  await db.read();
  if (!db.data) return res.status(500).send({ message: "Database not initialized" });
  const user = db.data.users.find(u => u.activationToken === token);

  if (!user) {
    return res.status(404).send({ message: "Invalid activation token." });
  }
  if (user.is_activated) {
    return res.status(400).send({ message: "Account already activated." });
  }

  const passwordHash = await bcrypt.hash(password, saltRounds);
  user.passwordHash = passwordHash;
  user.publicKey = publicKey;
  user.encryptedPrivateKey = encryptedPrivateKey;
  user.is_activated = true;
  user.activationToken = null;

  await db.write();
  res.status(200).send({ message: "Account activated successfully!" });
});

// User login
app.post('/api/login', async (req: Request, res: Response) => {
  const { name, password } = req.body;

  await db.read();
  if (!db.data) return res.status(500).send({ message: "Database not initialized" });
  const user = db.data.users.find(u => u.name === name && u.is_activated);
  if (!user || !user.passwordHash) {
    return res.status(401).send({ message: "Invalid credentials or account not activated." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).send({ message: "Invalid credentials." });
  }

  const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.status(200).send({
    token: jwtToken,
    user: {
      id: user.id,
      name: user.name,
      publicKey: user.publicKey,
      encryptedPrivateKey: user.encryptedPrivateKey
    }
  });
});

// Get a user's public key
app.get('/api/users/:userId/key', async (req: Request, res: Response) => {
  await db.read();
  if (!db.data) return res.status(500).send({ message: "Database not initialized" });
  const user = db.data.users.find(u => u.id === req.params.userId && u.is_activated);
  if (!user || !user.publicKey) {
    return res.status(404).send({ message: "User not found or not activated." });
  }
  res.send({ publicKey: user.publicKey });
});

// Post an encrypted message
app.post('/api/trees/:userId/messages', async (req: Request, res: Response) => {
  const { encryptedContent, authorName } = req.body;
  const { userId } = req.params;

  await db.read();
  if (!db.data) return res.status(500).send({ message: "Database not initialized" });
    const newMessage: Message = {
      id: nanoid(),
      treeOwnerId: userId,
      encryptedContent: encryptedContent,
      authorName: authorName || 'Anonymous',
      createdAt: new Date().toISOString(),
    };
    db.data.messages.push(newMessage);
    await db.write();
  
    console.log(`[Log] New message posted to tree of user: ${userId}`);
  
    res.status(201).send({ message: "Message posted successfully!" });
  });
  
  // Middleware to authenticate JWT
  const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user as { userId: string };
      next();
    });
  };
  
  // Get messages for the logged-in user
  app.get('/api/guestbook/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).send({ message: "Authentication error" });
    
    await db.read();
    if (!db.data) return res.status(500).send({ message: "Database not initialized" });
    
    console.log(`[Log] User ${user.userId} fetched their messages.`);
  
    const messages = db.data.messages.filter(m => m.treeOwnerId === user.userId);
    res.send(messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

// Get all activated users
app.get('/api/users', async (req: Request, res: Response) => {
  await db.read();
  if (!db.data) return res.status(500).send({ message: "Database not initialized" });
  const activatedUsers = db.data.users
    .filter(u => u.is_activated)
    .map(u => ({ id: u.id, name: u.name }));
  res.send(activatedUsers);
});

// --- SERVER START ---
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});