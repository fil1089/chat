import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, setCors } from '../_db.js';

export default async function handler(req, res) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const sql = getDb();

    try {
        const result = await sql`
            SELECT id, email, password_hash FROM users
            WHERE email = ${email.toLowerCase()} LIMIT 1
        `;

        if (result.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const user = result[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        return res.status(200).json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
        console.error('[login] error:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
    }
}
