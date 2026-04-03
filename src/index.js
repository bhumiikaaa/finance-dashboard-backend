#!/usr/bin/env node

/**
 * Finance Dashboard Backend - Main Application
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/env');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

// Middleware imports
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const recordRoutes = require('./routes/records');
const dashboardRoutes = require('./routes/dashboard');

// Initialize Express app
const app = express();

// ============ Security Middleware ============
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ============ Body Parser & Logging ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// HTTP Request Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============ Health Check Endpoint ============
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============ API Routes ============
app.use(`/api/${config.api.version}/auth`, authRoutes);
app.use(`/api/${config.api.version}/users`, userRoutes);
app.use(`/api/${config.api.version}/records`, recordRoutes);
app.use(`/api/${config.api.version}/dashboard`, dashboardRoutes);

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'Finance Dashboard Backend API',
    version: '1.0.0',
    description: 'RESTful API for financial management with RBAC',
    baseUrl: config.api.baseUrl,
    documentation: 'See README.md for detailed API documentation'
  });
});

// ============ Error Handling ============
// 404 Handler - must be after all routes
app.use(notFoundHandler);

// Global Error Handler - must be last
app.use(errorHandler);

// ============ Server Startup ============
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    const server = app.listen(config.port, () => {
      logger.info('Server started successfully', {
        port: config.port,
        environment: config.nodeEnv,
        apiVersion: config.api.version
      });

      console.log(`
╔════════════════════════════════════════════════╗
║   Finance Dashboard Backend - Server Started   ║
╠════════════════════════════════════════════════╣
║ Port: ${config.port}
║ Environment: ${config.nodeEnv}
║ API Base URL: ${config.api.baseUrl}
║ Health Check: http://localhost:${config.port}/health
║ API Docs: http://localhost:${config.port}/api/docs
╚════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    message: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason,
    promise: promise
  });
});

// Start the server
startServer();

module.exports = app;
