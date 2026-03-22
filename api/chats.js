import { getSupabaseAdmin, setCors, verifySupabaseToken } from './_db.js';

export default async function handler(req, res) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const payload = await verifySupabaseToken(req);
    if (payload && payload.error) {
        return res.status(401).json({ error: 'Unauthorized', reason: payload.reason });
    }

    const supabase = getSupabaseAdmin();
    const userId = payload.sub;

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('chats')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            
            const chats = data.map(c => ({
                id: c.id,
                title: c.title,
                model: c.model,
                spaceId: c.space_id || undefined,
                createdAt: parseInt(c.created_at) || 0,
                updatedAt: parseInt(c.updated_at) || 0,
                messages: [] // loaded separately
            }));

            return res.status(200).json({ chats });
        } catch (err) {
            console.error('[chats GET] error:', err);
            return res.status(500).json({ error: err.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const { chat } = req.body;
            if (!chat || !chat.id) return res.status(400).json({ error: 'Missing chat data' });

            // Upsert chat metadata
            const { error: chatError } = await supabase
                .from('chats')
                .upsert({
                    id: chat.id,
                    user_id: userId,
                    title: chat.title || 'Новый чат',
                    model: chat.model || '',
                    space_id: chat.spaceId || null,
                    created_at: chat.createdAt || Date.now(),
                    updated_at: chat.updatedAt || Date.now()
                });

            if (chatError) throw chatError;

            // Upsert messages for this chat
            if (chat.messages && chat.messages.length > 0) {
                const messagesToInsert = chat.messages.map(m => ({
                    id: m.id,
                    chat_id: chat.id,
                    role: m.role || '',
                    content: m.content || '',
                    display_content: m.displayContent || null,
                    model: m.model || null,
                    usage: m.usage || null,
                    attachments: m.attachments || null,
                    full_attachments: m.fullAttachments || null,
                    timestamp: m.timestamp || Date.now(),
                    reasoning_content: m.reasoningContent || null,
                    annotations: m.annotations || null,
                    versions: m.versions || null,
                    active_version: m.activeVersion !== undefined ? m.activeVersion : null
                }));

                const { error: msgError } = await supabase
                    .from('messages')
                    .upsert(messagesToInsert);

                if (msgError) throw msgError;
            }

            return res.status(200).json({ ok: true });
        } catch (err) {
            console.error('[chats POST] error:', err);
            return res.status(500).json({ error: err.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const { chatId } = req.body;
            if (!chatId) return res.status(400).json({ error: 'Missing chatId' });

            const { error } = await supabase
                .from('chats')
                .delete()
                .eq('id', chatId)
                .eq('user_id', userId);

            if (error) throw error;
            return res.status(200).json({ ok: true });
        } catch (err) {
            console.error('[chats DELETE] error:', err);
            return res.status(500).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
