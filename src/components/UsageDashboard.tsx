'use client';

import { useEffect, useState } from 'react';
import type { UsageResponse } from '@/types';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-4 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold mt-1 capitalize">{value}</p>
    </div>
  );
}

export default function UsageDashboard() {
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/usage')
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setUsage(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-500 text-center py-6">Loading…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!usage) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Plan" value={String(usage.plan ?? 'free')} />
        {usage.requests_used != null && usage.requests_limit != null && (
          <Stat label="Requests this period" value={`${usage.requests_used} of ${usage.requests_limit}`} />
        )}
      </div>
      {(usage.period_start || usage.period_end) && (
        <p className="text-xs text-gray-400">
          Period:{' '}
          {usage.period_start ? new Date(String(usage.period_start)).toLocaleDateString() : '—'}
          {' – '}
          {usage.period_end ? new Date(String(usage.period_end)).toLocaleDateString() : '—'}
        </p>
      )}
    </div>
  );
}
