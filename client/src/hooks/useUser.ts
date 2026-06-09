import { useState, useEffect, useCallback } from 'react';
import { api, User, TelegramUserId, getTelegramUser } from '../utils/api';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const tgUser = getTelegramUser();

      if (tgUser?.id) {
        const tgId = String(tgUser.id);
        const result = await api.register({
          telegramId: tgId,
          username: tgUser.username || '',
          firstName: tgUser.first_name || '',
        });

        const fresh = await api.getUser(tgId);
        setUser(fresh.user);
      } else {
        const testId = 'test_user_123';
        const result = await api.register({
          telegramId: testId,
          username: 'TestUser',
          firstName: 'Test',
        });
        const fresh = await api.getUser(testId);
        setUser(fresh.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const tgId = TelegramUserId() || 'test_user_123';
      const result = await api.getUser(tgId);
      setUser(result.user);
    } catch {}
  }, []);

  const claimSpin = useCallback(async () => {
    try {
      const result = await api.claimSpin();
      setUser(prev => prev ? {
        ...prev,
        balance: result.balance,
        spins_remaining: result.spinsRemaining,
      } : null);
      return result;
    } catch (err: any) {
      throw err;
    }
  }, []);

  const playSlots = useCallback(async (bet: number) => {
    try {
      const result = await api.slotsSpin(bet);
      setUser(prev => prev ? {
        ...prev,
        balance: result.balance,
      } : null);
      return result;
    } catch (err: any) {
      throw err;
    }
  }, []);

  useEffect(() => {
    initUser();
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, [initUser]);

  return {
    user,
    loading,
    error,
    refreshUser,
    claimSpin,
    playSlots,
  };
}
