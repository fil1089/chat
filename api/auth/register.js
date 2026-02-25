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
    if (password.length < 6) {
        return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    }

    const sql = getDb();

    try {
        const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`;
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const result = await sql`
            INSERT INTO users (email, password_hash)
            VALUES (${email.toLowerCase()}, ${passwordHash})
            RETURNING id, email, created_at
        `;

        const user = result[0];
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        return res.status(201).json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
        console.error('[register] error:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
    }
}
