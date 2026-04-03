/**
 * Dashboard Routes
 * Routes for dashboard analytics and summary endpoints
 */

const express = require('express');
const router = express.Router();
const RecordController = require('../controllers/FinancialRecordController');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

/**
 * @route   GET /api/v1/dashboard/summary
 * @desc    Get financial summary (total income, expense, net balance)
 * @access  Private (All authenticated users)
 */
router.get(
  '/summary',
  authenticate,
  requirePermission('analytics:read'),
  RecordController.getSummary
);

/**
 * @route   GET /api/v1/dashboard/trends
 * @desc    Get monthly financial trends
 * @access  Private (All authenticated users)
 */
router.get(
  '/trends',
  authenticate,
  requirePermission('analytics:read'),
  RecordController.getMonthlyTrends
);

/**
 * @route   GET /api/v1/dashboard/categories
 * @desc    Get category-wise breakdown
 * @access  Private (All authenticated users)
 */
router.get(
  '/categories',
  authenticate,
  requirePermission('analytics:read'),
  RecordController.getCategoryBreakdown
);

/**
 * @route   GET /api/v1/dashboard/recent
 * @desc    Get recent transactions
 * @access  Private (All authenticated users)
 */
router.get(
  '/recent',
  authenticate,
  requirePermission('analytics:read'),
  RecordController.getRecentTransactions
);

module.exports = router;
