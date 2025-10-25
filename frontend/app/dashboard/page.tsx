'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import ConversationItem from '@/app/ui/conversation-item';

import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface StatsSummary {
  total_conversations: number;
  by_source: {
    [key: string]: number;
  };
}

interface TagStat {
  name: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [tagStats, setTagStats] = useState<TagStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBarClick = (data: TagStat) => {
    router.push(`/?q=${encodeURIComponent(data.name)}`);
  };
  
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

      // Fetch tag statistics
      const tagsRes = await fetch('http://localhost:8000/api/v1/statistics/tags', { headers });
      if (!tagsRes.ok) throw new Error('Failed to fetch tag stats');
      const tagsData = await tagsRes.json();
      setTagStats(tagsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sourceData = summary ? Object.entries(summary.by_source).map(([name, value]) => ({ name, value })) : [];

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
    <div className="p-12 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Stat Card: Total Conversations */}
          <div className="p-6 rounded-lg bg-surface border border-border">
            <h2 className="text-lg font-semibold text-text-secondary mb-2">Total Conversations</h2>
            <p className="text-5xl font-bold text-text-primary">{summary?.total_conversations ?? 0}</p>
          </div>

          {/* Stat Card: Conversations by Source */}
          <div className="p-6 rounded-lg bg-surface border border-border md:col-span-2">
            <h2 className="text-lg font-semibold text-text-secondary mb-2">By Source</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tag Frequency Chart */}
        <div className="p-6 rounded-lg bg-surface border border-border">
          <h2 className="text-lg font-semibold text-text-secondary mb-4">Top Tags</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={tagStats}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} interval={0} tick={{ fontSize: 14 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" onClick={handleBarClick} style={{ cursor: 'pointer' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

