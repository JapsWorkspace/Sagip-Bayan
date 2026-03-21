// myapp/lib/api.js
// One Axios client that works for emulator, real devices, ngrok, and production.
// Expo-friendly: no native changes required.

import axios from 'axios';
import { Platform } from 'react-native';

/* -------------------------------------------------------------------------- */
/*                               CONFIGURE THESE                               */
/* -------------------------------------------------------------------------- */

// 1) Your laptop's LAN IP (for real phone via Expo Go)
//    Find it via `ipconfig` (Windows) / `ifconfig` (macOS/Linux).
const LAN_IP = '192.168.1.6'; // <-- your LAN IP

// 2) Optional HTTPS tunnel for dev (works anywhere, avoids HTTP issues)
//    Example: 'https://abcd-12-34-56-78.ngrok.app'
const NGROK_URL = ''; // <-- paste your tunnel URL if you use one

// 3) Your backend port in dev
const PORT = 8000;

// 4) A quick endpoint to probe reachability (GET)
const HEALTH_PATH = '/health'; // or '/incident/getIncidents' if that responds 200 quickly

// 5) Your production API base (HTTPS)
const PROD_BASE = 'https://YOUR-PROD-API.com'; // <-- set for release

// 6) OPTIONAL: temporarily force a base during debugging (overrides detection in dev)
// const FORCE_BASE = 'https://abcd-12-34-56-78.ngrok.app';
// const FORCE_BASE = 'http://192.168.1.6:8000';
const FORCE_BASE = '';

/* -------------------------------------------------------------------------- */
/*                              RUNTIME CANDIDATES                             */
/* -------------------------------------------------------------------------- */

// Candidate bases for development (ordered by priority)
const candidatesDev = [
  // 1) HTTPS tunnel (best for phones & teammates)
  ...(NGROK_URL ? [NGROK_URL] : []),
  // 2) Real phone on same Wi‑Fi
  `http://${LAN_IP}:${PORT}`,
  // 3) Emulator alias (iOS simulator will use localhost)
  Platform.OS === 'android' ? `http://10.0.2.2:${PORT}` : `http://localhost:${PORT}`,
];

// Cache the chosen base for this session
let resolvedBase = null;

/**
 * Resolve a working base URL in development by pinging HEALTH_PATH with a short timeout.
 * First one that responds wins. Falls back to the first candidate if none respond.
 */
async function resolveDevBase() {
  if (resolvedBase) return resolvedBase;

  for (const base of candidatesDev) {
    try {
      // Slightly longer timeout for slower Wi‑Fi
      await axios.get(`${base}${HEALTH_PATH}`, { timeout: 2500 });
      resolvedBase = base;
      console.log('[api] using base:', resolvedBase);
      return resolvedBase;
    } catch (_) {
      // try next candidate
    }
  }

  // Nothing responded — fall back to the first candidate to avoid undefined baseURL.
  resolvedBase = candidatesDev[0];
  console.log('[api] fallback base:', resolvedBase);
  return resolvedBase;
}

/* -------------------------------------------------------------------------- */
/*                               AXIOS INSTANCE                                */
/* -------------------------------------------------------------------------- */

// In production we set the base immediately.
// In development we inject baseURL per-request once resolveDevBase() completes.
const api = axios.create({
  baseURL: __DEV__ ? undefined : PROD_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// In development, inject a resolved baseURL before each request.
api.interceptors.request.use(async (config) => {
  if (__DEV__) {
    if (FORCE_BASE) {
      config.baseURL = FORCE_BASE;
    } else {
      const base = await resolveDevBase();
      config.baseURL = base;
    }
  }
  return config;
});

// Helpful response interceptor to log issues (optional)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = (err?.config?.baseURL || '') + (err?.config?.url || '');
    console.log('[api] error:', {
      url,
      method: err?.config?.method,
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    return Promise.reject(err);
  }
);

export default api;