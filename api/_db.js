import { createClient } from '@supabase/supabase-js';

let supabaseAdmin = null;

export function getSupabaseAdmin() {
    if (!supabaseAdmin) {
        const url = process.env.SUPABASE_URL || 'https://zhqpqkqfxnwwhqdyfapf.supabase.co';
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!key) {
            console.error('[DB] SUPABASE_SERVICE_ROLE_KEY is not set!');
            throw new Error('Service Role Key is missing. Check Vercel Environment Variables.');
        }
        supabaseAdmin = createClient(url, key);
    }
    return supabaseAdmin;
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

    let admin;
    try {
        admin = getSupabaseAdmin();
    } catch (err) {
        return { error: 'init_failed', reason: err.message };
    }

    try {
        const { data: { user }, error } = await admin.auth.getUser(token);
        if (error || !user) {
            return { error: 'invalid_token', reason: error?.message || 'Invalid user' };
        }
        return { sub: user.id, email: user.email, role: 'authenticated' };
    } catch (err) {
        console.error('[Auth] Unexpected error verifying token:', err.message);
        return { error: 'verify_failed', reason: err.message };
    }
}
