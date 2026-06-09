import { Router, Request, Response } from 'express';
import { queryOne, queryAll, runQuery } from '../db';

const router = Router();

router.post('/register', (req: Request, res: Response): void => {
  const { telegramId, username, firstName } = req.body;

  if (!telegramId) {
    res.status(400).json({ error: 'telegramId is required' });
    return;
  }

  let user = queryOne<any>('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);

  if (!user) {
    const result = runQuery(
      'INSERT INTO users (telegram_id, username, first_name, balance, spins_remaining) VALUES (?, ?, ?, 500, 3)',
      [telegramId, username || '', firstName || '']
    );
    user = queryOne<any>('SELECT * FROM users WHERE id = ?', [result.lastInsertRowid]);
  } else {
    runQuery(
      'UPDATE users SET username = ?, first_name = ? WHERE telegram_id = ?',
      [username || '', firstName || '', telegramId]
    );
    user = queryOne<any>('SELECT * FROM users WHERE id = ?', [user.id]);
  }

  res.json({ user });
});

router.get('/user/:telegramId', (req: Request, res: Response): void => {
  const { telegramId } = req.params;

  const user = queryOne<any>('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  resetSpinsIfNeeded(user);
  const freshUser = queryOne<any>('SELECT * FROM users WHERE id = ?', [user.id]);
  res.json({ user: freshUser });
});

function resetSpinsIfNeeded(user: any): void {
  const now = new Date();
  const lastReset = new Date(user.last_spin_reset + 'Z');

  const isNewDay = now.getUTCDate() !== lastReset.getUTCDate() ||
    now.getUTCMonth() !== lastReset.getUTCMonth() ||
    now.getUTCFullYear() !== lastReset.getUTCFullYear();

  if (isNewDay) {
    runQuery(
      "UPDATE users SET spins_remaining = 3, last_spin_reset = datetime('now') WHERE id = ?",
      [user.id]
    );
  }
}

export default router;
