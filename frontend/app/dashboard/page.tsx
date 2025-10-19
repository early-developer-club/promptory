'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import ConversationItem from '@/app/ui/conversation-item';

interface StatsSummary {
  total_conversations: number;
  by_source: {
    [key: string]: number;
  };
}

interface Conversation {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  created_at: string;
}

// New component for the conversation list
function ConversationList({ conversations, onDelete }: { conversations: Conversation[], onDelete: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Conversations</h2>
      {conversations.map(convo => (
        <ConversationItem 
          key={convo.id} 
          {...convo} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      // Fetch summary statistics
      const summaryRes = await fetch('http://localhost:8000/api/v1/statistics/summary', { headers });
      if (!summaryRes.ok) throw new Error('Failed to fetch summary stats');
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      // Fetch conversations
      const convosRes = await fetch('http://localhost:8000/api/v1/conversations', { headers });
      if (!convosRes.ok) throw new Error('Failed to fetch conversations');
      const convosData = await convosRes.json();
      setConversations(convosData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

        setConversations(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }
  };

  if (loading && !summary) { // Show initial loading state only
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!token) {
    return <div className="text-center p-8">Please log in to view the dashboard.</div>;
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full px-6 py-4 rounded-full bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Stat Card: Total Conversations */}
          <div className="p-6 rounded-lg bg-surface border border-border">
            <h2 className="text-lg font-semibold text-text-secondary mb-2">Total Conversations</h2>
            <p className="text-5xl font-bold text-text-primary">{summary?.total_conversations ?? 0}</p>
          </div>

          {/* Stat Card: Conversations by Source */}
          <div className="p-6 rounded-lg bg-surface border border-border">
            <h2 className="text-lg font-semibold text-text-secondary mb-2">By Source</h2>
            <div className="text-3xl font-bold text-text-primary">
              <p>ChatGPT: {summary?.by_source?.CHAT_GPT ?? 0}</p>
              <p>Gemini: {summary?.by_source?.GEMINI ?? 0}</p>
            </div>
          </div>
        </div>

        <ConversationList conversations={conversations} onDelete={handleDelete} />
      </div>
    </div>
  );
}

