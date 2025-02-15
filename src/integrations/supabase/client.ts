import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://vrkxovunejlbqphxqnuy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZya3hvdnVuZWpsYnFwaHhxbnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0NTAxNzQsImV4cCI6MjA1NTAyNjE3NH0.lZxebcdjnUKDy2RG16Qd0aZgr7tQO9ONaQzQ_cVuPeE";

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
