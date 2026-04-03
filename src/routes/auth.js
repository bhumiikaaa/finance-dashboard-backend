/**
 * Auth Routes
 * Routes for authentication endpoints
 */

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../validators/middleware');
const { userValidationSchemas } = require('../validators/schemas');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateBody(userValidationSchemas.register), UserController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateBody(userValidationSchemas.login), UserController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', UserController.refreshAccessToken);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, UserController.getProfile);

module.exports = router;
