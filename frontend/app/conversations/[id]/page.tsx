'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { fetchJson, apiUrl } from '@/app/lib/api';

interface Conversation {
  id: number;
  source: string;
  prompt: string;
  response: string;
  summary?: string;
  conversation_timestamp: string;
  tags: { name: string }[];
}

export default function ConversationPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();

  // id: string | string[] 가능 → 안전하게 string으로 정규화
  const rawId = (params as Record<string, string | string[]>).id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversation = useCallback(async () => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const data = await fetchJson<Conversation>(`/api/v1/conversations/${id}`, { headers });
      setConversation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  const handleDelete = async () => {
    if (!token || !id) return;
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const res = await fetch(apiUrl(`/api/v1/conversations/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete conversation.');
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  if (loading) return <div className="text-center p-8">Loading conversation...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!conversation) return <div className="text-center p-8">No conversation data found.</div>;

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface rounded-lg border border-border shadow-sm p-8">
          <div className="border-b border-border pb-6 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Conversation Details</h1>
              <p className="text-sm text-text-secondary mt-2">
                Source: <span className="font-semibold">{conversation.source}</span> | Recorded on{' '}
                {new Date(conversation.conversation_timestamp + 'Z').toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Delete
            </button>
          </div>

          {conversation.summary && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">Summary</h2>
              <div className="p-6 rounded-lg bg-background border border-border">
                <p className="text-text-secondary italic">{conversation.summary}</p>
              </div>
            </div>
          )}

          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-4">Prompt</h3>
              <div className="p-6 rounded-lg bg-background border border-border">
                <p className="text-text-secondary whitespace-pre-wrap">{conversation.prompt}</p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-4">Response</h3>
              <div className="p-6 rounded-lg bg-background border border-border">
                <p className="text-text-secondary whitespace-pre-wrap">{conversation.response}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-2xl font-semibold text-text-primary mb-4">Tags</h3>
            <div className="flex flex-wrap gap-4">
              {conversation.tags.length > 0 ? (
                conversation.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="bg-gray-200 text-text-secondary text-sm font-medium px-4 py-2 rounded-full border border-border"
                  >
                    {tag.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-text-secondary">No tags associated with this conversation.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
