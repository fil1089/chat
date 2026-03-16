// API URL configuration
// In development: uses Vite proxy (/api/polza/...)
// In production (Vercel): calls external APIs directly

const isDev = import.meta.env.DEV;

export const API_URLS = {
    polza: 'https://polza.ai/api', // Direct connection, Polza API supports CORS
} as const;
