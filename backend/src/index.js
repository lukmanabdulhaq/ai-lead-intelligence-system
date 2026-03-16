require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const leadsRouter = require('./routes/leads');
const webhookRouter = require('./routes/webhook');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security middleware ──
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Rate limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ── Body parsing ──
app.use(express.json({ limit: '10kb' }));

// ── Routes ──
app.use('/api/leads', leadsRouter);
app.use('/api/webhook', webhookRouter);

// ── Health check ──
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 AI Lead Intelligence API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Leads:  http://localhost:${PORT}/api/leads\n`);
});
