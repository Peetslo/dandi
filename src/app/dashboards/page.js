'use client';

import { useState, useEffect } from 'react';

export default function DashboardsPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [revealedKeys, setRevealedKeys] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    limitMonthlyUsage: false,
    usageLimit: 1000,
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Fetch API keys on component mount
  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingKey(null);
    setFormData({ name: '', key: '', limitMonthlyUsage: false, usageLimit: 1000 });
    setShowModal(true);
  };

  const handleEdit = (apiKey) => {
    setEditingKey(apiKey);
    setFormData({
      name: apiKey.name,
      key: apiKey.key,
      limitMonthlyUsage: apiKey.usageLimit !== undefined && apiKey.usageLimit !== null,
      usageLimit: apiKey.usageLimit || 1000,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchApiKeys();
        showToast('API key deleted successfully');
      } else {
        alert('Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Error deleting API key');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingKey
        ? `/api/api-keys/${editingKey.id}`
        : '/api/api-keys';
      const method = editingKey ? 'PUT' : 'POST';

      // Prepare payload based on create vs edit
      const payload = editingKey
        ? {
            name: formData.name,
            key: formData.key,
          }
        : {
            name: formData.name,
            ...(formData.limitMonthlyUsage && { usageLimit: formData.usageLimit }),
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        fetchApiKeys();
        setFormData({ name: '', key: '', limitMonthlyUsage: false, usageLimit: 1000 });
        showToast(editingKey ? 'API key updated successfully' : 'API key created successfully');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save API key');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      alert('Error saving API key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('API key copied to clipboard!');
  };

  const toggleReveal = (id) => {
    const newRevealed = new Set(revealedKeys);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
    }
    setRevealedKeys(newRevealed);
  };

  const maskKey = (key) => {
    if (key.length <= 4) return key;
    return key.substring(0, 4) + '-'.repeat(17);
  };

  const totalUsage = apiKeys.reduce((sum, key) => sum + (key.usage || 0), 0);
  const apiLimit = 1000;

  return (
    <div className="relative min-h-full bg-white">
      {/* Toast pop-up */}
      {toast.show && (
        <div
          className={`fixed left-1/2 top-6 z-[100] -translate-x-1/2 rounded-lg px-6 py-3 shadow-lg transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top green accent strip */}
      <div className="h-1 w-full bg-green-400"></div>

      <div className="mx-auto max-w-7xl px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 text-sm text-gray-500">Pages / Overview</div>
            <h1 className="text-4xl font-bold text-black">Overview</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Operational</span>
            </div>
            <div className="flex items-center gap-4">
              <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Current Plan Card */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider opacity-90">
                CURRENT PLAN
              </div>
              <div className="mb-6 text-3xl font-bold">Researcher</div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm">API Limit</span>
                <svg className="h-4 w-4 opacity-75" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-white bg-opacity-20">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${(totalUsage / apiLimit) * 100}%` }}
                ></div>
              </div>
              <div className="text-sm opacity-90">
                {totalUsage} / {apiLimit.toLocaleString()} Requests
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-white/20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-white/30 hover:from-purple-500/30 hover:to-pink-500/30 hover:shadow-xl hover:shadow-purple-500/30">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Manage Plan
            </button>
          </div>
        </div>

        {/* API Keys Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-black">API Keys</h2>
              <button
                onClick={handleCreate}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-400/30 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:border-indigo-400/50 hover:from-indigo-500/40 hover:to-purple-500/40 hover:shadow-xl hover:shadow-indigo-500/30"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          <p className="mb-6 text-sm text-gray-600">
            The key is used to authenticate your requests to the Research API. To learn more, see the{' '}
            <a href="#" className="text-blue-600 hover:underline">Research API</a> link and the{' '}
            <a href="#" className="text-blue-600 hover:underline">documentation page</a> link.
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">Loading...</div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">
                No API keys found. Create your first API key to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      NAME
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      USAGE
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      KEY
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      OPTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {apiKeys.map((apiKey) => (
                    <tr key={apiKey.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                        {apiKey.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                        {apiKey.usage || 0}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <code className="font-mono">
                          {revealedKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                        </code>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleReveal(apiKey.id)}
                            className="rounded-lg border border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2 text-blue-700 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:scale-110 hover:border-blue-400/50 hover:from-blue-500/30 hover:to-cyan-500/30 hover:shadow-xl hover:shadow-blue-500/30"
                            title={revealedKeys.has(apiKey.id) ? 'Hide key' : 'Reveal key'}
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {revealedKeys.has(apiKey.id) ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              )}
                            </svg>
                          </button>
                          <button
                            onClick={() => copyToClipboard(apiKey.key)}
                            className="rounded-lg border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-2 text-emerald-700 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:scale-110 hover:border-emerald-400/50 hover:from-emerald-500/30 hover:to-teal-500/30 hover:shadow-xl hover:shadow-emerald-500/30"
                            title="Copy to clipboard"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(apiKey)}
                            className="rounded-lg border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 p-2 text-amber-700 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:scale-110 hover:border-amber-400/50 hover:from-amber-500/30 hover:to-yellow-500/30 hover:shadow-xl hover:shadow-amber-500/30"
                            title="Edit"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(apiKey.id)}
                            className="rounded-lg border border-red-400/30 bg-gradient-to-br from-red-500/20 to-rose-500/20 p-2 text-red-700 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:scale-110 hover:border-red-400/50 hover:from-red-500/30 hover:to-rose-500/30 hover:shadow-xl hover:shadow-red-500/30"
                            title="Delete"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for Create/Edit */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-2 text-xl font-bold text-black">
                {editingKey ? 'Edit API Key' : 'Create a new API key'}
              </h2>
              {!editingKey && (
                <p className="mb-6 text-sm text-gray-600">
                  Enter a name and limit for the new API key.
                </p>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Key Name — A unique name to identify this key
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Key Name"
                  />
                </div>
                
                {!editingKey && (
                  <>
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="limitMonthlyUsage"
                        checked={formData.limitMonthlyUsage}
                        onChange={(e) =>
                          setFormData({ ...formData, limitMonthlyUsage: e.target.checked })
                        }
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="limitMonthlyUsage" className="ml-2 block text-sm font-medium text-gray-700">
                        Limit monthly usage*
                      </label>
                    </div>
                    
                    {formData.limitMonthlyUsage && (
                      <div>
                        <input
                          type="number"
                          min="1"
                          value={formData.usageLimit}
                          onChange={(e) =>
                            setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 1000 })
                          }
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="1000"
                        />
                      </div>
                    )}
                    
                    <p className="text-xs italic text-gray-500">
                      *If the combined usage of all your keys exceeds your plan's limit, all requests will be rejected.
                    </p>
                  </>
                )}
                
                {editingKey && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      API Key
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.key}
                      onChange={(e) =>
                        setFormData({ ...formData, key: e.target.value })
                      }
                      className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="tvly-..."
                    />
                  </div>
                )}
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg border border-gray-400/30 bg-gradient-to-br from-gray-500/20 to-slate-500/20 px-4 py-2 text-sm font-medium text-gray-700 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-gray-400/50 hover:from-gray-500/30 hover:to-slate-500/30 hover:shadow-lg hover:shadow-gray-500/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg border border-blue-400/30 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-blue-400/50 hover:from-blue-500/40 hover:to-indigo-500/40 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    {editingKey ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
