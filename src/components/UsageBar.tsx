'use client';

import { useEffect, useState } from 'react';

interface UsageData {
  plan?: string;
  requests_used?: number;
  requests_limit?: number;
  ai_requests_used?: number;
  ai_requests_limit?: number;
  billing_period_start?: string | number;
  billing_period_end?: string | number;
}

function safeDate(input: string | number | undefined): string {
  if (!input) return '—';
  const d = new Date(typeof input === 'number' ? input : input);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
}

function pct(used: number, limit: number): number {
  if (!limit || limit <= 0 || used < 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export default function UsageBar({ refreshKey = 0 }: { refreshKey?: number }) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/usage')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setUsage(data);
      })
      .catch((err) => setError(err.message));
  }, [refreshKey]);

  // ---------- error state ----------
  if (error) {
    return (
      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
        ⚠️ Could not load usage: {error}
      </div>
    );
  }

  // ---------- loading skeleton ----------
  if (!usage) {
    return (
      <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse space-y-2">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  // ---------- safe defaults ----------
  const plan = usage.plan || 'free';
  const reqUsed = usage.requests_used ?? 0;
  const reqLimit = usage.requests_limit ?? 0;
  const aiUsed = usage.ai_requests_used ?? 0;
  const aiLimit = usage.ai_requests_limit ?? 0;
  const resetDate = usage.billing_period_end;

  const reqPercent = pct(reqUsed, reqLimit);
  const aiPercent = pct(aiUsed, aiLimit);

  const barColor = (value: number) =>
    value > 90 ? 'bg-red-500' : value > 70 ? 'bg-amber-500' : 'bg-emerald-500';

  // ---------- rendered UI ----------
  return (
    <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 dark:text-gray-200">Plan</span>
          <span className="capitalize bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs font-medium">
            {plan}
          </span>
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-xs">
          Resets{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {safeDate(resetDate)}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">API Requests</span>
          <span className="text-gray-500 font-mono">
            {reqUsed.toLocaleString()} / {reqLimit.toLocaleString()}
          </span>
        </div>
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor(reqPercent)}`}
            style={{ width: `${reqPercent}%` }}
          />
        </div>
        <p className="text-right text-[10px] text-gray-400">{reqPercent}% used</p>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">AI Calls (Gemini)</span>
          <span className="text-gray-500 font-mono">
            {aiUsed.toLocaleString()} / {aiLimit.toLocaleString()}
          </span>
        </div>
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor(aiPercent)}`}
            style={{ width: `${aiPercent}%` }}
          />
        </div>
        <p className="text-right text-[10px] text-gray-400">{aiPercent}% used</p>
      </div>
    </div>
  );
}