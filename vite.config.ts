import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/store': 'http://localhost:3001',
            '/api/neuro': {
                target: 'https://neuroapi.host',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/neuro/, ''),
            },
            '/api/you-search': {
                target: 'https://ydc-index.io',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/you-search/, ''),
            },
            '/api/you-agent': {
                target: 'https://api.you.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/you-agent/, ''),
            },
        },
    },
});
