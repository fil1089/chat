export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Ideally, we'd look up the user in a DB and create a reset token.
        // For this demo/simple app, we just simulate success.
        console.log(`Password reset requested for: ${email}`);

        // Simulating email delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return res.status(200).json({ ok: true, message: 'Recovery email sent (simulated)' });
    } catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
