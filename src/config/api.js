/** Production API on Render; override with VITE_API_URL in Vercel if needed. */
const PRODUCTION_API_URL = 'https://vitality-api-ylo5.onrender.com';

function resolveApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  // If running in browser and on localhost, ALWAYS use the local backend
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://127.0.0.1:8000`; // Force 127.0.0.1 to avoid IPv6 issues
    }
  }

  // Otherwise, if it's a production build (e.g. Vercel), use the live API
  if (import.meta.env.PROD) {
    return 'https://vitality-api-ylo5.onrender.com';
  }

  return 'http://127.0.0.1:8000';
}

const API_BASE_URL = resolveApiBaseUrl();

export function apiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

export function wsUrl(path = '/ws') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const wsBase = API_BASE_URL.replace(/^http/, 'ws');
  return `${wsBase}${normalized}`;
}