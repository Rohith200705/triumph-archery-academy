const BASE = import.meta.env.VITE_API_URL || '/api';

export function getToken() {
  return localStorage.getItem('taa_token');
}

export function setSession(token, user) {
  localStorage.setItem('taa_token', token);
  localStorage.setItem('taa_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('taa_token');
  localStorage.removeItem('taa_user');
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('taa_user') || 'null');
  } catch {
    return null;
  }
}

export async function api(path, { method = 'GET', body, raw } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) clearSession();
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  if (raw) return data;
  return data;
}
