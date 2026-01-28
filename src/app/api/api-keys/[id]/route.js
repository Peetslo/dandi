import { createSupabaseServerClient } from '@/lib/supabase';

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

// PUT /api/api-keys/[id] - Update an API key
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const supabase = createSupabaseServerClient();
    const body = await request.json();
    const { name, key, description, usageLimit } = body;

    if (!name || !key) {
      return Response.json(
        { message: 'Name and key are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('api_keys')
      .update({
        name,
        key,
        description: description || '',
        usage_limit: typeof usageLimit === 'number' ? usageLimit : null,
      })
      .eq('id', id)
      .select('id, name, key, usage, description, usage_limit, created_at')
      .single();

    if (error) {
      console.error('Error updating API key in Supabase:', error);
      return Response.json(
        { message: 'Error updating API key', error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return Response.json({ message: 'API key not found' }, { status: 404 });
    }

    const updated = serializeApiKey(data);
    return Response.json(updated);
  } catch (error) {
    return Response.json(
      { message: 'Error updating API key', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/api-keys/[id] - Delete an API key
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const supabase = createSupabaseServerClient();

    const { error } = await supabase.from('api_keys').delete().eq('id', id);

    if (error) {
      console.error('Error deleting API key from Supabase:', error);
      return Response.json(
        { message: 'Error deleting API key', error: error.message },
        { status: 500 }
      );
    }

    return Response.json({ message: 'API key deleted successfully' });
  } catch (error) {
    return Response.json(
      { message: 'Error deleting API key', error: error.message },
      { status: 500 }
    );
  }
}
