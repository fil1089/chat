import { createClient } from '@supabase/supabase-js';

// Public keys — safe to hardcode, they're designed for client-side use
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
    || 'https://zhqpqkqfxnwwhqdyfapf.supabase.co';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpocXBxa3FmeG53d2hxZHlmYXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDY2MzIsImV4cCI6MjA4ODQ4MjYzMn0.iMkDK_umIQUjPm3db4FsEFidIK9FN_GD40EcecjcPkw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
