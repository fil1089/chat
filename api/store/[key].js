import { getSupabaseAdmin, setCors, verifySupabaseToken } from '../_db.js';

export default async function handler(req, res) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const payload = await verifySupabaseToken(req);
    if (payload && payload.error) {
        return res.status(401).json({ error: 'Unauthorized', reason: payload.reason });
    }

    let supabase;
    try {
        supabase = getSupabaseAdmin();
    } catch (err) {
        return res.status(500).json({ error: 'Database Config Error', details: err.message });
    }

    const { key } = req.query;
    const userId = payload.sub; // Supabase stores user ID in "sub" claim

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('user_store')
                .select('value')
                .eq('user_id', userId)
                .eq('key', key)
                .maybeSingle();

            if (error) throw error;
            return res.status(200).json({ value: data ? data.value : null });
        } catch (err) {
            console.error('[store GET] error:', err);
            return res.status(500).json({ error: 'Ошибка чтения: ' + err.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const { value } = req.body;
            const { error } = await supabase
                .from('user_store')
                .upsert({
                    user_id: userId,
                    key: key,
                    value: value,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id, key'
                });

            if (error) throw error;
            return res.status(200).json({ ok: true });
        } catch (err) {
            console.error('[store POST] error:', err);
            return res.status(500).json({ error: 'Ошибка записи: ' + err.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const { error } = await supabase
                .from('user_store')
                .delete()
                .eq('user_id', userId)
                .eq('key', key);

            if (error) throw error;
            return res.status(200).json({ ok: true });
        } catch (err) {
            console.error('[store DELETE] error:', err);
            return res.status(500).json({ error: 'Ошибка удаления: ' + err.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
