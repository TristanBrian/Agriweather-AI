'use client';

import { useState } from 'react';

interface TreeResult {
  total_tree_count: number;
  tree_density_per_acre: number | null;
  canopy_coverage_pct: number;
  tree_health: { healthy: number; needs_care: number; needs_replacement: number };
  observations: string[];
  recommendations: string[];
  overlay_image_url?: string;
}

export default function TreeUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TreeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await fetch('/api/trees', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <label className="block">
        <span className="text-sm font-medium">Upload farm image (drone or satellite)</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
        />
      </label>
      {preview && (
        <img src={preview} alt="Preview" className="max-h-64 rounded-lg shadow" />
      )}
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="bg-emerald-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-emerald-700"
      >
        {loading ? 'Analyzing...' : 'Count Trees'}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {result && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow text-sm space-y-2">
          <p>Total trees: <strong>{result.total_tree_count}</strong></p>
          {result.tree_density_per_acre && <p>Density: {result.tree_density_per_acre}/acre</p>}
          <p>Canopy cover: {result.canopy_coverage_pct}%</p>
          <div>
            Health:{' '}
            <span className="text-green-600">Healthy {result.tree_health.healthy}</span>,{' '}
            <span className="text-yellow-600">Needs care {result.tree_health.needs_care}</span>,{' '}
            <span className="text-red-600">Replace {result.tree_health.needs_replacement}</span>
          </div>
          {result.observations?.length > 0 && (
            <ul className="list-disc list-inside text-xs">
              {result.observations.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          )}
          {result.recommendations?.length > 0 && (
            <ul className="list-disc list-inside text-xs">
              {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          )}
          {result.overlay_image_url && (
            <img src={result.overlay_image_url} alt="Overlay" className="rounded" />
          )}
        </div>
      )}
    </div>
  );
}