/**
 * Simple Logger Utility
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const currentLogLevel = process.env.LOG_LEVEL || 'INFO';

const shouldLog = (level) => {
  const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
  return levels.indexOf(level) <= levels.indexOf(currentLogLevel);
};

const formatLog = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    level,
    message,
    ...(Object.keys(data).length > 0 && { data })
  };
};

const logger = {
  error: (message, data = {}) => {
    if (shouldLog('ERROR')) {
      console.error(JSON.stringify(formatLog(LOG_LEVELS.ERROR, message, data)));
    }
  },
  warn: (message, data = {}) => {
    if (shouldLog('WARN')) {
      console.warn(JSON.stringify(formatLog(LOG_LEVELS.WARN, message, data)));
    }
  },
  info: (message, data = {}) => {
    if (shouldLog('INFO')) {
      console.log(JSON.stringify(formatLog(LOG_LEVELS.INFO, message, data)));
    }
  },
  debug: (message, data = {}) => {
    if (shouldLog('DEBUG')) {
      console.log(JSON.stringify(formatLog(LOG_LEVELS.DEBUG, message, data)));
    }
  }
};

module.exports = logger;
