/**
 * Database Configuration and Connection
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-dashboard';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      dbName: mongoose.connection.name
    });

    return mongoose.connection;
  } catch (error) {
    logger.error('MongoDB connection failed', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('MongoDB disconnection failed', { message: error.message });
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
