import jwt from 'jsonwebtoken';
import { getDb, setCors, getToken } from '../_db.js';

export default async function handler(req, res) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const token = getToken(req);
    if (!token) return res.status(401).json({ error: 'Нет токена' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const sql = getDb();
        const result = await sql`SELECT id, email, created_at FROM users WHERE id = ${payload.userId} LIMIT 1`;
        if (result.length === 0) return res.status(401).json({ error: 'Пользователь не найден' });
        return res.status(200).json({ user: result[0] });
    } catch (err) {
        return res.status(401).json({ error: 'Невалидный токен' });
    }
}
