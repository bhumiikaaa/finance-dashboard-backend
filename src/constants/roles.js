/**
 * User Roles
 * @enum {string}
 */
const ROLES = {
  ADMIN: 'admin',
  ANALYST: 'analyst',
  VIEWER: 'viewer'
};

/**
 * Permissions mapping for each role
 * @type {Object}
 */
const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'records:create',
    'records:read',
    'records:update',
    'records:delete',
    'analytics:read',
    'analytics:export',
    'settings:manage'
  ],
  [ROLES.ANALYST]: [
    'records:create',
    'records:read',
    'records:update',
    'analytics:read',
    'analytics:export'
  ],
  [ROLES.VIEWER]: [
    'records:read',
    'analytics:read'
  ]
};

/**
 * User Status
 * @enum {string}
 */
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

/**
 * Financial Record Types
 * @enum {string}
 */
const RECORD_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

/**
 * Financial Categories
 * @enum {string}
 */
const CATEGORIES = {
  SALARY: 'salary',
  FREELANCE: 'freelance',
  INVESTMENT: 'investment',
  OTHER_INCOME: 'other_income',
  FOOD: 'food',
  TRANSPORT: 'transport',
  UTILITIES: 'utilities',
  ENTERTAINMENT: 'entertainment',
  HEALTHCARE: 'healthcare',
  EDUCATION: 'education',
  RENT: 'rent',
  OTHER_EXPENSE: 'other_expense'
};

module.exports = {
  ROLES,
  PERMISSIONS,
  USER_STATUS,
  RECORD_TYPES,
  CATEGORIES
};
