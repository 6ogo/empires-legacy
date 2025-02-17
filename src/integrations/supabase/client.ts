import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.supabaseUrl;
const supabaseAnonKey = import.meta.env.supabaseAnonKey;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'empires_legacy_auth',
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
