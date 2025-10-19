'use client';

import { useState, useEffect } from 'react';
import ConversationItem from '@/app/ui/conversation-item';
import { useAuth } from '@/app/context/AuthContext';

interface Conversation {
  id: string;
  prompt: string;
  summary: string | null;
  tags: { name: string }[];
  created_at: string;
}

export default function Home() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function fetchConversations() {
      setLoading(true);
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
        };
        const response = await fetch('http://localhost:8000/api/v1/conversations', { headers });

        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }

        const data: Conversation[] = await response.json();
        setAllConversations(data);
        setFilteredConversations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, [token]);

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = allConversations.filter(convo => {
      const tagsMatch = convo.tags.some(tag => tag.name.toLowerCase().includes(lowercasedTerm));
      return (
        convo.prompt.toLowerCase().includes(lowercasedTerm) ||
        (convo.summary && convo.summary.toLowerCase().includes(lowercasedTerm)) ||
        tagsMatch
      );
    });
    setFilteredConversations(filtered);
  }, [searchTerm, allConversations]);

  const handleDelete = async (id: string) => {
    if (!token) return;

    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/conversations/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete conversation.');
        }

        setAllConversations(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }
  };

  if (loading) {
    return <div>Loading conversations...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!token) {
    return <div>Please log in to see your conversations.</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <h2 className="text-2xl font-bold mb-4">Conversation List</h2>
      <div className="space-y-4">
        {filteredConversations.length > 0 ? (
          filteredConversations.map(convo => (
            <ConversationItem
              key={convo.id}
              id={convo.id}
              title={convo.prompt} // Using prompt as title
              summary={convo.summary ?? 'No summary available.'}
              tags={convo.tags.map(t => t.name)}
              created_at={convo.created_at}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p>No conversations found.</p>
        )}
      </div>
    </div>
  );
}
