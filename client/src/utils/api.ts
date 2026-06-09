const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const telegramId = TelegramUserId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (telegramId) {
    headers['x-telegram-id'] = telegramId;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export function TelegramUserId(): string | null {
  try {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user?.id) {
      return String(tg.initDataUnsafe.user.id);
    }
  } catch {}
  return null;
}

export function getTelegramUser() {
  try {
    return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
  } catch {
    return null;
  }
}

export interface User {
  id: number;
  telegram_id: string;
  username: string;
  first_name: string;
  balance: number;
  spins_remaining: number;
  total_earned: number;
  total_wagered: number;
  created_at: string;
}

export interface SpinResult {
  reward: number;
  spinsRemaining: number;
  balance: number;
}

export interface SlotsResult {
  reels: { name: string; id: number }[];
  winAmount: number;
  balance: number;
}

export const api = {
  register: (data: { telegramId: string; username?: string; firstName?: string }) =>
    request<User>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  getUser: (telegramId: string) =>
    request<{ user: User }>(`/auth/user/${telegramId}`),

  claimSpin: () =>
    request<SpinResult>('/spin/claim', { method: 'POST' }),

  spinHistory: () =>
    request<{ history: any[] }>('/spin/history'),

  slotsSpin: (bet: number) =>
    request<SlotsResult>('/slots/spin', { method: 'POST', body: JSON.stringify({ bet }) }),

  slotsHistory: () =>
    request<{ history: any[] }>('/slots/history'),
};
