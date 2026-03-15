import { getSupabaseAdmin, setCors, verifySupabaseToken } from '../_db.js';

export default async function handler(req, res) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        try {
            const supabase = getSupabaseAdmin();

            // Fetch all stored spaces rows across all users
            const { data, error } = await supabase
                .from('user_store')
                .select('value')
                .eq('key', 'aggregator_spaces');

            if (error) {
                console.error('[public_spaces GET] Error fetching from Supabase:', error);
                throw error;
            }

            let publicSpaces = [];

            if (data && data.length > 0) {
                // Determine structure: data is an array of rows { value: [Space1, Space2, ...] }
                for (const row of data) {
                    const spacesArray = row.value;
                    if (Array.isArray(spacesArray)) {
                        for (const space of spacesArray) {
                            if (space.isPublic) {
                                // Important: sanitize output for public consumption. Do NOT expose sensitive info.
                                publicSpaces.push({
                                    id: space.id,
                                    name: space.name,
                                    description: space.description,
                                    instructions: space.instructions,
                                    icon: space.icon,
                                    color: space.color,
                                    model: space.model,
                                    files: space.files, // Public helpers might share standard context files
                                    isPublic: space.isPublic,
                                    authorName: space.authorName || 'Аноним',
                                    createdAt: space.createdAt,
                                    updatedAt: space.updatedAt,
                                });
                            }
                        }
                    }
                }
            }

            // Sort newest first
            publicSpaces.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            return res.status(200).json({ spaces: publicSpaces });
        } catch (err) {
            console.error('[public_spaces GET] Unexpected error:', err);
            return res.status(500).json({ error: 'Failed to fetch public spaces: ' + err.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
