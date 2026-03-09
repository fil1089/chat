import { createClient } from '@supabase/supabase-js';

// Public keys — safe to hardcode, they're designed for client-side use
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
    || 'https://zhqpqkqfxnwwhqdyfapf.supabase.co';

const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
    || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || 'sb_publishable_F8junFMDzzXyUjk3Fyv39g_MZjNJs9r';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
