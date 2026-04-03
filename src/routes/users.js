/**
 * User Routes
 * Routes for user management
 */

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticate } = require('../middleware/auth');
const { requireRole, requireOwnerOrAdmin } = require('../middleware/rbac');
const { validateBody, validateQuery } = require('../validators/middleware');
const { userValidationSchemas, queryValidationSchema } = require('../validators/schemas');

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (paginated)
 * @access  Private (Admin Only)
 */
router.get(
  '/',
  authenticate,
  requireRole('admin'),
  validateQuery(queryValidationSchema),
  UserController.getAllUsers
);

/**
 * @route   GET /api/v1/users/:userId
 * @desc    Get user by ID
 * @access  Private (Admin or Owner)
 */
router.get('/:userId', authenticate, UserController.getUserById);

/**
 * @route   PUT /api/v1/users/:userId
 * @desc    Update user
 * @access  Private (Admin or Owner)
 */
router.put(
  '/:userId',
  authenticate,
  validateBody(userValidationSchemas.updateUser),
  UserController.updateUser
);

/**
 * @route   DELETE /api/v1/users/:userId
 * @desc    Delete user
 * @access  Private (Admin Only)
 */
router.delete('/:userId', authenticate, requireRole('admin'), UserController.deleteUser);

/**
 * @route   PUT /api/v1/users/:userId/change-password
 * @desc    Change user password
 * @access  Private (Owner Only)
 */
router.put(
  '/:userId/change-password',
  authenticate,
  validateBody(userValidationSchemas.changePassword),
  UserController.changePassword
);

/**
 * @route   POST /api/v1/users/:userId/reset-login
 * @desc    Reset user login attempts
 * @access  Private (Admin Only)
 */
router.post(
  '/:userId/reset-login',
  authenticate,
  requireRole('admin'),
  UserController.resetLoginAttempts
);

module.exports = router;
