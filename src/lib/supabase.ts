import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://pheguftotlraqdppaajl.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'ဒီနေရာမှာ_သင့်_anon_public_key_ထည့်ပါ';

// Supabase Dashboard ထဲက URL နဲ့ Key ထည့်ပါ
const ENV_SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Load custom configured URL & Key from localStorage if user sets it in UI
export const getActiveSupabaseConfig = () => {
  try {
    const savedUrl = localStorage.getItem('pos_supabase_url');
    const savedKey = localStorage.getItem('pos_supabase_anon_key');

    const url = (savedUrl || ENV_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
    const anonKey = (savedKey || ENV_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

    return { url, anonKey };
  } catch {
    return {
      url: ENV_SUPABASE_URL || DEFAULT_SUPABASE_URL,
      anonKey: ENV_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    };
  }
};

const activeConfig = getActiveSupabaseConfig();
export const SUPABASE_URL = activeConfig.url;
export const SUPABASE_ANON_KEY = activeConfig.anonKey;

// Helper to check if credentials are provided
export const isSupabaseConfigured = (url = getActiveSupabaseConfig().url, key = getActiveSupabaseConfig().anonKey): boolean => {
  return (
    Boolean(url) &&
    Boolean(key) &&
    !url.includes('YOUR_PROJECT_ID') &&
    !key.includes('YOUR_ANON_PUBLIC_KEY') &&
    !key.includes('ဒီနေရာမှာ') &&
    url.startsWith('https://') &&
    key.length > 20
  );
};


// Singleton Client instance
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL.startsWith('https://') ? SUPABASE_URL : 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Dynamic client creation with specific keys
export const getCustomSupabaseClient = (url: string, anonKey: string): SupabaseClient | null => {
  if (!isSupabaseConfigured(url, anonKey)) {
    return null;
  }
  try {
    return createClient(url.trim(), anonKey.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.error('Supabase client creation error:', err);
    return null;
  }
};

// Test connection helper
export const testSupabaseConnection = async (url?: string, anonKey?: string): Promise<{ success: boolean; message: string }> => {
  const targetUrl = url || getActiveSupabaseConfig().url;
  const targetKey = anonKey || getActiveSupabaseConfig().anonKey;

  if (!isSupabaseConfigured(targetUrl, targetKey)) {
    return {
      success: false,
      message: 'Supabase URL နှင့် Anon Key ကို ထည့်သွင်းထားခြင်း မရှိသေးပါ (သို့မဟုတ် Placeholder ဖြစ်နေပါသည်)။',
    };
  }

  try {
    const client = getCustomSupabaseClient(targetUrl, targetKey);
    if (!client) {
      return { success: false, message: 'Supabase Client အား ချိတ်ဆက်၍မရပါ' };
    }

    // Try a simple ping request
    const { error } = await client.from('pos_settings').select('id').limit(1);

    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "pos_settings" does not exist')) {
      // If table doesn't exist yet, connection is still valid!
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('JWT')) {
        return { success: false, message: `ချိတ်ဆက်မှု မအောင်မြင်ပါ: ${error.message}` };
      }
    }

    return {
      success: true,
      message: 'Supabase Cloud Database နှင့် အောင်မြင်စွာ ချိတ်ဆက်ပြီးပါပြီ!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `ချိတ်ဆက်မှု အမှားဖြစ်ပေါ်ပါသည်: ${err?.message || 'Server Unreachable'}`,
    };
  }
};
