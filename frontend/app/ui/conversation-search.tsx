'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ConversationItem from '@/app/ui/conversation-item';
import { useAuth } from '@/app/context/AuthContext';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/app/ui/date-picker';
import { format } from 'date-fns';

interface Conversation {
  id: string;
  prompt: string;
  summary: string | null;
  tags: { name: string }[];
  created_at: string;
}

export default function ConversationSearch() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearch);
  const [date, setDate] = useState<Date | undefined>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeDates, setActiveDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
  
  useEffect(() => {
    if (!token) return;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    async function fetchAllConversationDates() {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const response = await fetch(`${backendUrl}/api/v1/conversations`, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch conversation dates');
        }
        const data: Conversation[] = await response.json();
        const dates = data.map(c => new Date(c.created_at));
        setActiveDates(dates);
      } catch (err) {
        console.error(err);
      }
    }

    fetchAllConversationDates();
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    async function fetchConversations() {
      setLoading(true);
      setError(null);
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
        };
        
        const params = new URLSearchParams();
        if (debouncedSearchTerm) {
          params.append('q', debouncedSearchTerm);
        }
        if (date) {
          params.append('date', format(date, 'yyyy-MM-dd'));
        }

        const url = `${backendUrl}/api/v1/conversations?${params.toString()}`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }

        const data: Conversation[] = await response.json();
        setConversations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, [token, debouncedSearchTerm, date]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        const response = await fetch(`${backendUrl}/api/v1/conversations/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete conversation.');
        }

        setConversations(prev => prev.filter(c => c.id !== id));
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
      <div className="flex space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <DatePicker date={date} setDate={setDate} activeDates={activeDates} />
      </div>
      <h2 className="text-2xl font-bold mb-4">Conversation List</h2>
      <div className="space-y-4">
        {conversations.length > 0 ? (
          conversations.map(convo => (
            <ConversationItem
              key={convo.id}
              id={convo.id}
              title={convo.prompt}
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
