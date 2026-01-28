import { createSupabaseServerClient } from '@/lib/supabase';

// POST /api/protected - Validate API key
export async function POST(request) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string') {
      return Response.json({ valid: false, message: 'API key is required' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('api_keys')
      .select('id')
      .eq('key', apiKey.trim())
      .maybeSingle();

    if (error) {
      console.error('Error validating API key:', error);
      return Response.json({ valid: false, message: 'Validation failed' }, { status: 500 });
    }

    if (!data) {
      return Response.json({ valid: false, message: 'Invalid API Key' }, { status: 401 });
    }

    return Response.json({ valid: true, message: 'valid apy key, /protected can be accessed' });
  } catch (error) {
    console.error('Error in /api/protected:', error);
    return Response.json({ valid: false, message: 'Invalid API Key' }, { status: 500 });
  }
}
