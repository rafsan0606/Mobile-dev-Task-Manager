import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = ''; // Supabase project URL
const SUPABASE_ANON_KEY = ''; // Supabase anon public key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const TASKS_TABLE = 'tasks';
