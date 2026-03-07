import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

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
 * Verify Supabase JWT and return the payload.
 * Returns null if invalid.
 */
export function verifySupabaseToken(req) {
    const token = getToken(req);
    if (!token) return null;
    try {
        const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
        return payload;
    } catch {
        return null;
    }
}
