// Shared in-memory storage for API keys
// In production, replace this with a database connection

let apiKeys = [
  {
    id: '1',
    name: 'default',
    key: 'tvly-1234567890abcdef',
    usage: 24,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'tmp1',
    key: 'tvly-abcdef1234567890',
    usage: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'my-cool-api-key',
    key: 'tvly-9876543210fedcba',
    usage: 0,
    createdAt: new Date().toISOString(),
  },
];

export function getAllApiKeys() {
  return apiKeys;
}

export function getApiKeyById(id) {
  return apiKeys.find((k) => k.id === id);
}

export function createApiKey(apiKey) {
  const newApiKey = {
    id: Date.now().toString(),
    ...apiKey,
    usage: apiKey.usage || 0,
    createdAt: new Date().toISOString(),
  };
  apiKeys.push(newApiKey);
  return newApiKey;
}

export function updateApiKey(id, updates) {
  const index = apiKeys.findIndex((k) => k.id === id);
  if (index === -1) {
    return null;
  }
  apiKeys[index] = {
    ...apiKeys[index],
    ...updates,
  };
  return apiKeys[index];
}

export function deleteApiKey(id) {
  const index = apiKeys.findIndex((k) => k.id === id);
  if (index === -1) {
    return false;
  }
  apiKeys.splice(index, 1);
  return true;
}
