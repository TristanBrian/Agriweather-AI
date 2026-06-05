'use client';

import { useState, type ReactNode } from 'react';

interface TabsProps {
  weatherContent: ReactNode;
  hourlyContent: ReactNode;
}

export default function Tabs({ weatherContent, hourlyContent }: TabsProps) {
  const [activeTab, setActiveTab] = useState<'weather' | 'hourly'>('weather');

  return (
    <div>
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 pb-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('weather')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
            activeTab === 'weather'
              ? 'bg-white dark:bg-gray-800 text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Forecast
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hourly')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
            activeTab === 'hourly'
              ? 'bg-white dark:bg-gray-800 text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Hour-by-hour
        </button>
      </div>

      <div className={activeTab === 'weather' ? 'block' : 'hidden'}>{weatherContent}</div>
      <div className={activeTab === 'hourly' ? 'block' : 'hidden'}>{hourlyContent}</div>
    </div>
  );
}
