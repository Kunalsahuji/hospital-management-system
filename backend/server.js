const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const { errorHandler, notFound } = require('./src/middleware/errorMiddleware');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const logger = require('./src/utils/logger');

// Load env vars
dotenv.config();

// Connect to database
connectDB();
const app = express();
// Security middleware
app.use(helmet());


app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10kb' }));


// ─── HTTP Request Logging (morgan → winston) ──────────────────────────────────
app.use(morgan('dev', { stream: logger.stream }));


// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);

// Setup temporary basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Use error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.logInfo(`🚀 Hospital Appointment API running on port ${PORT} [${process.env.NODE_ENV}]`);
  logger.logInfo(`🌐 Accepting frontend from: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});
