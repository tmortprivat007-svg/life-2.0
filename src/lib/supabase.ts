import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * The anon/publishable key is designed for browser use.
 * Row Level Security must be enabled for every exposed table.
 * Never place a service_role key in this application.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export async function checkSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!supabase || !supabaseUrl || !supabaseAnonKey) {
    return { ok: false, message: 'Supabase mangler projekt-URL eller publishable/anon key.' };
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: supabaseAnonKey },
    });
    if (!response.ok) {
      return { ok: false, message: `Supabase svarede med HTTP ${response.status}.` };
    }
    return { ok: true, message: 'Supabase API svarer. Brug login nedenfor for at aktivere personlig datasynkronisering.' };
  } catch {
    return { ok: false, message: 'Kunne ikke oprette forbindelse til Supabase. Kontrollér URL og netværk.' };
  }
}
