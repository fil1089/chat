// API URL configuration
// In development: uses Vite proxy (/api/neuro/...)
// In production (Vercel): calls external APIs directly

const isDev = import.meta.env.DEV;

export const API_URLS = {
    neuro: isDev ? '/api/neuro' : 'https://neuroapi.host',
    polza: '/api/polza', // Always use proxy because Polza API blocks CORS from browser
    youSearch: isDev ? '/api/you-search' : 'https://ydc-index.io',
    youAgent: isDev ? '/api/you-agent' : 'https://api.you.com',
} as const;
