export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Example req.url: /api/polza/v1/chat/completions?query=1
    // We rewrite it to https://polza.ai/v1/chat/completions?query=1

    // The path is passed from vercel.json rewrite rule
    // e.g. /api/polza?polzapath=v1/chat/completions
    let targetPath = '';
    if (req.query && req.query.polzapath) {
        targetPath = '/' + req.query.polzapath;
    } else {
        targetPath = req.url.replace('/api/polza', '').split('?')[0];
    }

    const apiUrl = `https://polza.ai${targetPath}`;

    const headers = new Headers();
    if (req.headers.authorization) {
        headers.set('Authorization', req.headers.authorization);
    }
    if (req.headers['content-type']) {
        headers.set('Content-Type', req.headers['content-type']);
    }

    try {
        const response = await fetch(apiUrl, {
            method: req.method,
            headers,
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
        });

        const contentType = response.headers.get('content-type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }

        if (!response.ok) {
            const err = await response.text();
            return res.status(response.status).send(err);
        }

        // Handle Server-Sent Events (SSE) streaming
        if (contentType?.includes('text/event-stream')) {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            });

            // Vercel Edge/Serverless stream piping
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                res.write(chunk);
            }
            return res.end();
        }

        // Handle standard JSON response (like images)
        const data = await response.json();
        return res.status(200).json(data);

    } catch (e) {
        console.error('Polza API Proxy Error:', e);
        return res.status(500).json({ error: e.message || 'Internal proxy error' });
    }
}
