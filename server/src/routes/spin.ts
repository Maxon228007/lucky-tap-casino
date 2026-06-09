import { Router, Response } from 'express';
import { queryOne, queryAll, runQuery } from '../db';
import { AuthRequest } from '../middleware/auth';

const router = Router();

const SPIN_REWARDS = [1, 2, 5, 10, 20, 50, 100, 500];
const SPIN_REWARD_WEIGHTS = [0.3, 0.25, 0.18, 0.12, 0.08, 0.04, 0.02, 0.01];

function getWeightedReward(): number {
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < SPIN_REWARDS.length; i++) {
    cumulative += SPIN_REWARD_WEIGHTS[i];
    if (rand < cumulative) return SPIN_REWARDS[i];
  }
  return SPIN_REWARDS[SPIN_REWARDS.length - 1];
}

router.post('/claim', (req: AuthRequest, res: Response): void => {
  const telegramId = req.telegramId!;

  const user = queryOne<any>('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (user.spins_remaining <= 0) {
    res.status(400).json({ error: 'No spins remaining. Come back tomorrow!' });
    return;
  }

  const reward = getWeightedReward();

  runQuery(
    'UPDATE users SET balance = balance + ?, spins_remaining = spins_remaining - 1, total_earned = total_earned + ? WHERE id = ?',
    [reward, reward, user.id]
  );

  runQuery(
    'INSERT INTO spin_history (user_id, reward) VALUES (?, ?)',
    [user.id, reward]
  );

  const updatedUser = queryOne<any>('SELECT * FROM users WHERE id = ?', [user.id]);

  res.json({
    reward,
    spinsRemaining: updatedUser.spins_remaining,
    balance: updatedUser.balance,
  });
});

router.get('/history', (req: AuthRequest, res: Response): void => {
  const telegramId = req.telegramId!;
  const user = queryOne<any>('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const history = queryAll<any>(
    'SELECT * FROM spin_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [user.id]
  );

  res.json({ history });
});

export default router;
