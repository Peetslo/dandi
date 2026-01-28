'use client';

import { useState } from 'react';
import Link from 'next/link';
import Notification from '@/components/Notification';

export default function PlaygroundPage() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    setNotification({ show: false, message: '', type: 'success' });

    try {
      const response = await fetch('/api/protected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setNotification({
          show: true,
          message: 'valid apy key, /protected can be accessed',
          type: 'success',
        });
      } else {
        setNotification({
          show: true,
          message: data.message || 'Invalid API Key',
          type: 'error',
        });
      }
    } catch (err) {
      setNotification({
        show: true,
        message: 'Invalid API Key',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((n) => ({ ...n, show: false }))}
      />

      <div className="mx-auto max-w-lg px-6 py-16">
        <Link
          href="/dashboards"
          className="mb-6 inline-block text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="mb-2 text-3xl font-bold text-black">API Playground</h1>
        <p className="mb-8 text-gray-600">Submit your API key to validate access to /protected.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="tvly-..."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Validating...' : 'Validate API Key'}
          </button>
        </form>
      </div>
    </div>
  );
}
