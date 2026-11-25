export const API_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'florup_token';

export const getToken = (): string => localStorage.getItem(TOKEN_KEY) || '';

export const setToken = (token: string): void => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data as { error?: string } | null)?.error || `Ошибка сервера (${res.status})`);
  }
  return data as T;
}
