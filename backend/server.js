const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { apiLimiter, resumeLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const interviewState = require('./services/interviewState');
const { checkAIAvailability } = require('./services/aiService');
const validateEnv = require('./utils/validateEnv');

dotenv.config();
validateEnv();

const app = express();

app.set('trust proxy', 1);

connectDB();

setInterval(interviewState.sweep, 5 * 60 * 1000).unref();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      workerSrc: ["'self'", "blob:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https://api.groq.com", "https://wandbox.org", "https://upload.imagekit.io", "https://ik.imagekit.io"],
      frameSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(mongoSanitize());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/', apiLimiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/code', require('./routes/code'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health/ai', async (req, res) => {
  const available = await checkAIAvailability();
  res.json({ available, mode: available ? 'ai' : 'fallback', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced shutdown after 10s timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});