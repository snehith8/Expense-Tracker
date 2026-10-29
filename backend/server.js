const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. Rate Limiting for Auth Endpoints (Brute-Force Protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many login/register attempts. Please try again after 15 minutes.',
  },
});

// 3. CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// 4. Request Body Parsers with Safe Size Limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// 5. Apply Rate Limiter to Auth Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 6. Mount Application Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: `Expense Tracker API running on port ${process.env.PORT || 8000}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`),
);

module.exports = app;
