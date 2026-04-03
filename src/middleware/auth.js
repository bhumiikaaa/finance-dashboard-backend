/**
 * JWT Authentication Middleware
 * Handles token verification and user extraction from JWT
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { AuthenticationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Extract and verify JWT token from Authorization header
 * @returns {Function} Middleware function
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    // Find user and attach to request
    const user = await User.findById(decoded.userId).lean();

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (user.status === 'inactive') {
      throw new AuthenticationError('User account is inactive');
    }

    if (user.isLocked) {
      throw new AuthenticationError('Account is locked. Please try again later.');
    }

    // Attach user info to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      fullName: user.fullName
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AuthenticationError('Token has expired'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AuthenticationError('Invalid token'));
    }
    next(error);
  }
};

/**
 * Extract token from Authorization header
 * Expected format: Bearer <token>
 * @param {Object} req - Express request object
 * @returns {string|null} Token or null if not found
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Generate JWT Token
 * @param {Object} payload - Data to encode in token
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn });
};

/**
 * Generate Refresh Token
 * @param {Object} payload - Data to encode in token
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn
  });
};

/**
 * Verify Refresh Token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

/**
 * Optional authentication - doesn't fail if no token provided
 * @returns {Function} Middleware function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.userId).lean();

    if (user) {
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        fullName: user.fullName
      };
    }

    next();
  } catch (error) {
    logger.warn('Optional auth failed', { message: error.message });
    next();
  }
};

module.exports = {
  authenticate,
  extractToken,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  optionalAuth
};
