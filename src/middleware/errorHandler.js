/**
 * Error Handling Middleware
 * Catches and formats errors for consistent API responses
 */

const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

/**
 * Global error handling middleware
 * Must be registered last in middleware stack
 * @returns {Function} Middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  const logData = {
    method: req.method,
    path: req.path,
    statusCode: err.statusCode || 500,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  if (err.statusCode >= 500) {
    logger.error('Server error', logData);
  } else {
    logger.warn('Client error', logData);
  }

  // Default to 500 error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || {};

  // If it's not an AppError, convert to generic error in production
  if (!(err instanceof AppError) && process.env.NODE_ENV === 'production') {
    statusCode = 500;
    message = 'Internal Server Error';
    details = {};
  }

  // Send error response
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(Object.keys(details).length > 0 && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found middleware
 * Must be registered after all routes
 * @returns {Function} Middleware function
 */
const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.method} ${req.path} not found`,
    path: req.path
  });
};

/**
 * Async error wrapper for route handlers
 * Wraps async functions to catch errors and pass to error handler
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
