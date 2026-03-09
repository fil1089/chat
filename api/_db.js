import { neon } from '@neondatabase/serverless';
import { createClient } from '@supabase/supabase-js';

let supabaseAdmin = null;

export function getDb() {
    const dbUrl = process.env.SUPABASE_DATABASE_URL;
    if (!dbUrl) {
        console.error('[DB] SUPABASE_DATABASE_URL is not set!');
        throw new Error('Database URL is missing. Check Vercel Environment Variables.');
    }
    return neon(dbUrl);
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
 * Returns user payload { sub, email, role } or an error object { error, reason }.
 */
export async function verifySupabaseToken(req) {
    const token = getToken(req);
    if (!token) {
        return { error: 'no_token', reason: 'No Bearer token in request' };
    }

    // Hardcoded project URL as fallback to be safe
    const url = process.env.SUPABASE_URL || 'https://zhqpqkqfxnwwhqdyfapf.supabase.co';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!key) {
        console.error('[Auth] SUPABASE_SERVICE_ROLE_KEY is not set!');
        return { error: 'no_secret', reason: 'Service Role Key is missing on the server' };
    }

    if (!supabaseAdmin) {
        try {
            supabaseAdmin = createClient(url, key);
        } catch (err) {
            console.error('[Auth] Error creating admin client:', err.message);
            return { error: 'init_failed', reason: err.message };
        }
    }

    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            return { error: 'invalid_token', reason: error?.message || 'Invalid user' };
        }
        return { sub: user.id, email: user.email, role: 'authenticated' };
    } catch (err) {
        console.error('[Auth] Unexpected error verifying token:', err.message);
        return { error: 'verify_failed', reason: err.message };
    }
}
