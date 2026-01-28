import { createSupabaseServerClient } from '@/lib/supabase';

function generateApiKey() {
  const part = () => Math.random().toString(36).slice(2, 10);
  return `tvly-${part()}${part()}`;
}

function serializeApiKey(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    key: row.key,
    usage: row.usage ?? 0,
    usageLimit: row.usage_limit ?? null,
    description: row.description ?? '',
    createdAt: row.created_at,
  };
}

// GET /api/api-keys - Fetch all API keys
export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, key, usage, description, usage_limit, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching API keys from Supabase:', error);
      return Response.json(
        {
          message: 'Error fetching API keys',
          error: error.message,
          details: error,
        },
        { status: 500 }
      );
    }

    const apiKeys = (data || []).map(serializeApiKey);
    return Response.json(apiKeys);
  } catch (error) {
    return Response.json(
      { message: 'Error fetching API keys', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/api-keys - Create a new API key
export async function POST(request) {
  try {
    const supabase = createSupabaseServerClient();
    const body = await request.json();
    const { name, key, description, usageLimit } = body;

    if (!name) {
      return Response.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }

    const finalKey = key || generateApiKey();

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        name,
        key: finalKey,
        description: description || '',
        usage: 0,
        usage_limit: typeof usageLimit === 'number' ? usageLimit : null,
      })
      .select('id, name, key, usage, description, usage_limit, created_at')
      .single();

    if (error) {
      console.error('Error creating API key in Supabase:', error);
      return Response.json(
        {
          message: 'Error creating API key',
          error: error.message,
          details: error,
        },
        { status: 500 }
      );
    }

    const newApiKey = serializeApiKey(data);
    return Response.json(newApiKey, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: 'Error creating API key', error: error.message },
      { status: 500 }
    );
  }
}
