/**
 * RBAC (Role-Based Access Control) Middleware
 * Enforces permission checks based on user roles
 */

const { PERMISSIONS } = require('../constants/roles');
const { AuthorizationError } = require('../utils/errors');

/**
 * Require user to be authenticated
 * @returns {Function} Middleware function
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return next(new AuthorizationError('Authentication required'));
  }
  next();
};

/**
 * Require specific role(s)
 * @param {...string} allowedRoles - Role(s) to allow
 * @returns {Function} Middleware function
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AuthorizationError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};

/**
 * Require specific permission(s)
 * @param {...string} requiredPermissions - Permission(s) required
 * @returns {Function} Middleware function
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required'));
    }

    const userPermissions = PERMISSIONS[req.user.role] || [];

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return next(
        new AuthorizationError(
          `Access denied. Required permissions: ${requiredPermissions.join(', ')}`
        )
      );
    }

    next();
  };
};

/**
 * Require user to own the resource or be an admin
 * Assumes the resource has a userId field
 * @returns {Function} Middleware function
 */
const requireOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AuthorizationError('Authentication required'));
  }

  const resourceUserId = req.params.userId || req.body.userId;

  if (req.user.role !== 'admin' && req.user.id.toString() !== resourceUserId) {
    return next(
      new AuthorizationError('Access denied. You can only access your own resources.')
    );
  }

  next();
};

/**
 * Check if user is owner of record or has admin role
 * Used for resource-level access control
 * @param {string} userIdField - Field name in resource that contains userId
 * @returns {Function} Middleware function
 */
const checkResourceOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required'));
    }

    if (!req.resource) {
      return next(new AuthorizationError('Resource not found'));
    }

    const resourceUserId = req.resource[userIdField];

    if (req.user.role !== 'admin' && req.user.id.toString() !== resourceUserId.toString()) {
      return next(
        new AuthorizationError('Access denied. You do not have permission to access this resource.')
      );
    }

    next();
  };
};

/**
 * Middleware to load and attach resource to request
 * Must be used before checkResourceOwnership
 * @param {Function} loadFn - Function that loads the resource
 * @returns {Function} Middleware function
 */
const loadResourceMiddleware = (loadFn) => {
  return async (req, res, next) => {
    try {
      const resource = await loadFn(req);
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * RBAC levels for easy reference
 */
const RBAC_LEVELS = {
  ANYONE: 'anyone',
  AUTHENTICATED: ['admin', 'analyst', 'viewer'],
  ANALYST_PLUS: ['admin', 'analyst'],
  ADMIN_ONLY: ['admin']
};

module.exports = {
  requireAuth,
  requireRole,
  requirePermission,
  requireOwnerOrAdmin,
  checkResourceOwnership,
  loadResourceMiddleware,
  RBAC_LEVELS
};
