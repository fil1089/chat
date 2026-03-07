import { getDb, setCors, verifySupabaseToken } from '../_db.js';

export default async function handler(req, res) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const payload = verifySupabaseToken(req);
    if (!payload) return res.status(401).json({ error: 'Unauthorized' });

    const { key } = req.query;
    const userId = payload.sub; // Supabase stores user ID in "sub" claim
    const sql = getDb();

    if (req.method === 'GET') {
        try {
            const result = await sql`
                SELECT value FROM user_store
                WHERE user_id = ${userId} AND key = ${key}
                LIMIT 1
            `;
            return res.status(200).json({ value: result.length > 0 ? result[0].value : null });
        } catch (err) {
            console.error('[store GET] error:', err);
            return res.status(500).json({ error: 'Ошибка чтения' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { value } = req.body;
            await sql`
                INSERT INTO user_store (user_id, key, value, updated_at)
                VALUES (${userId}, ${key}, ${JSON.stringify(value)}, NOW())
                ON CONFLICT (user_id, key)
                DO UPDATE SET value = ${JSON.stringify(value)}, updated_at = NOW()
            `;
            return res.status(200).json({ ok: true });
        } catch (err) {
            console.error('[store POST] error:', err);
            return res.status(500).json({ error: 'Ошибка записи' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await sql`DELETE FROM user_store WHERE user_id = ${userId} AND key = ${key}`;
            return res.status(200).json({ ok: true });
        } catch (err) {
            console.error('[store DELETE] error:', err);
            return res.status(500).json({ error: 'Ошибка удаления' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
