/**
 * User Service Layer
 * Business logic for user operations
 */

const User = require('../models/User');
const { ValidationError, AuthenticationError, NotFoundError, ConflictError } = require('../utils/errors');
const { USER_STATUS } = require('../constants/roles');

class UserService {
  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser({ email, password, fullName, role }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError(`User with email ${email} already exists`);
    }

    const user = new User({
      email,
      password,
      fullName,
      role
    });

    await user.save();

    // Return user without password
    return this.formatUserResponse(user);
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User document
   */
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User document
   */
  async findById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authenticated user
   */
  async authenticateUser(email, password) {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (user.isLocked) {
      throw new AuthenticationError('Account is locked. Please try again later.');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incLoginAttempts();
      throw new AuthenticationError('Invalid email or password');
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return this.formatUserResponse(user);
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, updateData) {
    // Check for email uniqueness if email is being updated
    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email,
        _id: { $ne: userId }
      });

      if (existingUser) {
        throw new ConflictError('Email already in use');
      }
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return this.formatUserResponse(user);
  }

  /**
   * Delete user (soft delete)
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { status: USER_STATUS.INACTIVE },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError('User');
    }
  }

  /**
   * Get all users (with pagination)
   * @param {Object} query - Query options
   * @returns {Promise<Object>} Paginated users list
   */
  async getAllUsers({
    page = 1,
    limit = 20,
    sortBy = '_id',
    sortOrder = -1
  } = {}) {
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const total = await User.countDocuments();

    return {
      data: users.map(u => this.formatUserResponse(u)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new NotFoundError('User');
    }

    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid password');
    }

    user.password = newPassword;
    await user.save();
  }

  /**
   * Reset user login attempts and unlock account
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async resetLoginAttempts(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    await user.resetLoginAttempts();
  }

  /**
   * Format user response (exclude sensitive data)
   * @param {Object} user - User document
   * @returns {Object} Formatted user
   */
  formatUserResponse(user) {
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    delete userObj.loginAttempts;
    delete userObj.lockUntil;
    return userObj;
  }
}

module.exports = new UserService();
