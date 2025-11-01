import React, { useState, FormEvent } from 'react';

interface CreatedGroup {
  id: string;
  name: string;
}

interface ActivationLink {
  name: string;
  link: string;
}

function AdminPage() {
  const [groupName, setGroupName] = useState<string>('');
  const [createdGroup, setCreatedGroup] = useState<CreatedGroup | null>(null);
  
  const [memberNames, setMemberNames] = useState<string>('');
  const [activationLinks, setActivationLinks] = useState<ActivationLink[]>([]);
  const [error, setError] = useState<string>('');

  const handleCreateGroup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:3001/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName }),
      });
      if (!response.ok) throw new Error('Group creation failed');
      const group: CreatedGroup = await response.json();
      setCreatedGroup(group);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleAddMembers = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!createdGroup) {
      setError('Create a group first.');
      return;
    }
    try {
      const names = memberNames.split('\n').filter(name => name.trim() !== '');
      const response = await fetch(`http://localhost:3001/api/groups/${createdGroup.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names }),
      });
      if (!response.ok) throw new Error('Adding members failed');
      const links: ActivationLink[] = await response.json();
      setActivationLinks(links);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  return (
    <div>
      <h2>Group & Member Management</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!createdGroup ? (
        <form onSubmit={handleCreateGroup}>
          <h3>1. Create a Group</h3>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            required
          />
          <button type="submit">Create Group</button>
        </form>
      ) : (
        <div>
          <h3>Group '{createdGroup.name}' Created!</h3>
          <form onSubmit={handleAddMembers}>
            <h3>2. Add Members</h3>
            <p>Enter one member name per line.</p>
            <textarea
              value={memberNames}
              onChange={(e) => setMemberNames(e.target.value)}
              placeholder="Alice\nBob\nCharlie"
              rows="5"
              required
            />
            <br />
            <button type="submit">Add Members & Generate Links</button>
          </form>
        </div>
      )}

      {activationLinks.length > 0 && (
        <div>
          <h3>3. Share Activation Links</h3>
          <p>Copy these links and send them to the respective members.</p>
          <ul>
            {activationLinks.map((item, index) => (
              <li key={index}>
                <strong>{item.name}:</strong> <input type="text" readOnly value={item.link} size={60} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
