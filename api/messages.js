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
    const { chatId } = req.query;

    if (req.method === 'GET') {
        if (!chatId) return res.status(400).json({ error: 'Missing chatId' });

        try {
            // Check ownership
            const { data: chatData, error: chatError } = await supabase
                .from('chats')
                .select('id')
                .eq('id', chatId)
                .eq('user_id', userId)
                .single();

            if (chatError || !chatData) {
                return res.status(404).json({ error: 'Chat not found' });
            }

            // Get messages
            const { data: msgData, error: msgError } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('timestamp', { ascending: true }); 

            if (msgError) throw msgError;

            // Format back to frontend structure
            const messages = msgData.map(m => {
                const msg = {
                    id: m.id,
                    role: m.role,
                    content: m.content || '',
                    timestamp: parseInt(m.timestamp) || 0,
                };
                
                if (m.display_content) msg.displayContent = m.display_content;
                if (m.model) msg.model = m.model;
                if (m.usage) msg.usage = m.usage;
                if (m.attachments) msg.attachments = m.attachments;
                if (m.full_attachments) msg.fullAttachments = m.full_attachments;
                if (m.reasoning_content) msg.reasoningContent = m.reasoning_content;
                if (m.annotations) msg.annotations = m.annotations;
                if (m.versions) msg.versions = m.versions;
                if (m.active_version !== null && m.active_version !== undefined) msg.activeVersion = m.active_version;
                
                return msg;
            });

            return res.status(200).json({ messages });
        } catch (err) {
            console.error('[messages GET] error:', err);
            return res.status(500).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
