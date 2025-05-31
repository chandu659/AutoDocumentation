import { createClient } from '@supabase/supabase-js';

// Supabase client setup
const supabaseUrl = 'https://lyifmwfyudvqjhfouugn.supabase.co';

// We need to add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file
// You can get this from your Supabase project settings > API
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseKey && typeof window !== 'undefined') {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Create a single supabase client for interacting with your database and storage
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
