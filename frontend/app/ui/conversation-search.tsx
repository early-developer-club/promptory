'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ConversationItem from '@/app/ui/conversation-item';
import { useAuth } from '@/app/context/AuthContext';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/app/ui/date-picker';
import { format } from 'date-fns';
import { fetchJson, apiUrl } from '@/app/lib/api';

interface Conversation {
  id: string;
  prompt: string;
  summary: string | null;
  tags: { name: string }[];
  created_at: string;
}

export default function ConversationSearch() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearch);
  const [date, setDate] = useState<Date | undefined>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeDates, setActiveDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // debounce searchTerm
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // fetch all conversation dates (for DatePicker highlights)
  useEffect(() => {
    if (isAuthLoading || !token) return;

    async function fetchAllConversationDates() {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const data = await fetchJson<Conversation[]>('/api/v1/conversations', { headers });
        const dates = data.map((c) => new Date(c.created_at));
        setActiveDates(dates);
      } catch (err) {
        console.error(err);
      }
    }

    fetchAllConversationDates();
  }, [token, isAuthLoading]);

  // fetch conversations with filters
  useEffect(() => {
    if (isAuthLoading) return;
    if (!token) {
      setLoading(false);
      return;
    }

    async function fetchConversations() {
      setLoading(true);
      setError(null);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const params = new URLSearchParams();
        if (debouncedSearchTerm) params.append('q', debouncedSearchTerm);
        if (date) params.append('date', format(date, 'yyyy-MM-dd'));

        const qs = params.toString();
        const path = qs ? `/api/v1/conversations?${qs}` : '/api/v1/conversations';

        const data = await fetchJson<Conversation[]>(path, { headers });
        setConversations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, [token, debouncedSearchTerm, date, isAuthLoading]);

  const handleDelete = async (id: string) => {
    if (!token) return;

    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        const res = await fetch(apiUrl(`/api/v1/conversations/${id}`), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to delete conversation.');
        setConversations((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }
  };

  if (loading || isAuthLoading) return <div>Loading conversations...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!token) return <div>Please log in to see your conversations.</div>;

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
          conversations.map((convo) => (
            <ConversationItem
              key={convo.id}
              id={convo.id}
              title={convo.prompt}
              tags={convo.tags.map((t) => t.name)}
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
