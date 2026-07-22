import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { prisma } from './db';

const app = express();
const port = Number(process.env.PORT) || 6000;

app.use(cors());
app.use(express.json());

// Liveness: the process is up and serving.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Readiness: the process can reach the database.
app.get('/api/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'up' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'down' });
    console.error('Database health check failed:', error);
  }
});

const server = app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

// Graceful shutdown so containers stop cleanly.
const shutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
