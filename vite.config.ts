import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    server: {
        proxy: {
            '/store': 'http://localhost:3001',
            '/api/store': 'http://localhost:3001',
            '/api/polza': {
                target: 'https://polza.ai',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/polza/, '/api'),
            },
        },
    },
});
