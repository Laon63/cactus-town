import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicUser } from '../types';

function HomePage() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/users');
        if (!response.ok) throw new Error('Failed to fetch users.');
        const data: PublicUser[] = await response.json();
        setUsers(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Welcome to Cactus Town!</h2>
      <p>What would you like to do?</p>
      <nav>
        <ul>
          <li>
            <Link to="/admin">Create a new group and invite members</Link>
          </li>
          <li>
            <Link to="/login">Login to view your guestbook</Link>
          </li>
        </ul>
      </nav>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {users.length > 0 && (
        <div>
          <h3>Visit a Tree:</h3>
          <ul>
            {users.map(user => (
              <li key={user.id}>
                <Link to={`/tree/${user.id}`}>{user.name}'s Tree</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default HomePage;
