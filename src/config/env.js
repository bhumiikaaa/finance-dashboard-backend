/**
 * Environment Configuration
 */

require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-dashboard',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your_secret_key_change_on_production',
    expiresIn: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  },

  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: true
  },

  rateLimit: {
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100
  },

  api: {
    version: process.env.API_VERSION || 'v1',
    baseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api/v1'
  },

  logLevel: process.env.LOG_LEVEL || 'info'
};

module.exports = config;
