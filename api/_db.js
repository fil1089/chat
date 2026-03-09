import { neon } from '@neondatabase/serverless';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase admin client (uses service_role key to verify user tokens)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export function getDb() {
    const sql = neon(process.env.SUPABASE_DATABASE_URL);
    return sql;
}

export function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function getToken(req) {
    const auth = req.headers['authorization'] || '';
    if (auth.startsWith('Bearer ')) return auth.slice(7);
    return null;
}

/**
 * Verify user's access token via Supabase Auth (server-side).
 * Returns user payload { sub, email, role } or null if invalid.
 */
export async function verifySupabaseToken(req) {
    const token = getToken(req);
    if (!token) {
        console.error('[Auth] No Bearer token in request');
        return null;
    }
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[Auth] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set!');
        return null;
    }
    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            console.error('[Auth] Token verification failed:', error?.message || 'no user');
            return null;
        }
        return { sub: user.id, email: user.email, role: 'authenticated' };
    } catch (err) {
        console.error('[Auth] Unexpected error verifying token:', err.message);
        return null;
    }
}
