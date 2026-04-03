/**
 * User Controller
 * Handles HTTP requests for user operations
 */

const UserService = require('../services/UserService');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * Register new user
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, fullName, role } = req.validatedBody;

  const user = await UserService.createUser({
    email,
    password,
    fullName,
    role
  });

  const token = generateToken({ userId: user._id });
  const refreshToken = generateRefreshToken({ userId: user._id });

  logger.info('User registered successfully', { email });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      tokens: {
        accessToken: token,
        refreshToken
      }
    }
  });
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;

  const user = await UserService.authenticateUser(email, password);

  const token = generateToken({ userId: user._id });
  const refreshToken = generateRefreshToken({ userId: user._id });

  logger.info('User logged in successfully', { email });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      tokens: {
        accessToken: token,
        refreshToken
      }
    }
  });
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    const { verifyRefreshToken } = require('../middleware/auth');
    const decoded = verifyRefreshToken(refreshToken);
    const user = await UserService.findById(decoded.userId);

    const newAccessToken = generateToken({ userId: user._id });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

/**
 * Get current user profile
 * GET /api/v1/users/me
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await UserService.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: UserService.formatUserResponse(user)
  });
});

/**
 * Update user profile
 * PUT /api/v1/users/:userId
 */
const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updateData = req.validatedBody;

  const user = await UserService.updateUser(userId, updateData);

  logger.info('User updated', { userId });

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

/**
 * Change password
 * PUT /api/v1/users/:userId/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { oldPassword, newPassword } = req.validatedBody;

  await UserService.changePassword(userId, oldPassword, newPassword);

  logger.info('Password changed', { userId });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Delete user (admin only)
 * DELETE /api/v1/users/:userId
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  await UserService.deleteUser(userId);

  logger.info('User deleted', { userId });

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * Get all users (admin only)
 * GET /api/v1/users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder } = req.validatedQuery;

  const result = await UserService.getAllUsers({
    page,
    limit,
    sortBy,
    sortOrder: sortOrder === 'asc' ? 1 : -1
  });

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

/**
 * Get user by ID (admin or owner)
 * GET /api/v1/users/:userId
 */
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await UserService.findById(userId);

  res.status(200).json({
    success: true,
    data: UserService.formatUserResponse(user)
  });
});

/**
 * Reset user login attempts (admin only)
 * POST /api/v1/users/:userId/reset-login
 */
const resetLoginAttempts = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  await UserService.resetLoginAttempts(userId);

  logger.info('Login attempts reset', { userId });

  res.status(200).json({
    success: true,
    message: 'Login attempts reset successfully'
  });
});

module.exports = {
  register,
  login,
  refreshAccessToken,
  getProfile,
  updateUser,
  changePassword,
  deleteUser,
  getAllUsers,
  getUserById,
  resetLoginAttempts
};
