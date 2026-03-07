import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    server: {
        proxy: {
            '/store': 'http://localhost:3001',
            '/api/store': 'http://localhost:3001',
            '/api/neuro': {
                target: 'https://neuroapi.host',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/neuro/, ''),
            },
            '/api/polza': {
                target: 'https://polza.ai',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/polza/, '/api'),
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
