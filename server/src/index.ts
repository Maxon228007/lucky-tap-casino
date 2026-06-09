import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDb, closeDb } from './db';
import authRoutes from './routes/auth';
import spinRoutes from './routes/spin';
import slotsRoutes from './routes/slots';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/spin', authMiddleware, spinRoutes);
app.use('/api/slots', authMiddleware, slotsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const distPath = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  try {
    await initDb();
    console.log('Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`LuckyTap Casino server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  process.exit(0);
});

start();

export default app;
