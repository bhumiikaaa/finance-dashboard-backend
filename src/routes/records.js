/**
 * Financial Record Routes
 * Routes for financial record CRUD operations
 */

const express = require('express');
const router = express.Router();
const RecordController = require('../controllers/FinancialRecordController');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { validateBody, validateQuery } = require('../validators/middleware');
const { recordValidationSchemas } = require('../validators/schemas');

/**
 * @route   POST /api/v1/records
 * @desc    Create a new financial record
 * @access  Private (Analyst, Admin)
 */
router.post(
  '/',
  authenticate,
  requirePermission('records:create'),
  validateBody(recordValidationSchemas.create),
  RecordController.createRecord
);

/**
 * @route   GET /api/v1/records
 * @desc    Get all records for user with filtering and pagination
 * @access  Private (All authenticated users)
 */
router.get(
  '/',
  authenticate,
  requirePermission('records:read'),
  validateQuery(recordValidationSchemas.query),
  RecordController.getRecords
);

/**
 * @route   GET /api/v1/records/export
 * @desc    Export records
 * @access  Private (Analyst and above)
 */
router.get(
  '/export',
  authenticate,
  requirePermission('analytics:export'),
  RecordController.exportRecords
);

/**
 * @route   GET /api/v1/records/:recordId
 * @desc    Get single record by ID
 * @access  Private (Owner or Admin)
 */
router.get('/:recordId', authenticate, requirePermission('records:read'), RecordController.getRecordById);

/**
 * @route   PUT /api/v1/records/:recordId
 * @desc    Update financial record
 * @access  Private (Owner or Admin)
 */
router.put(
  '/:recordId',
  authenticate,
  requirePermission('records:update'),
  validateBody(recordValidationSchemas.update),
  RecordController.updateRecord
);

/**
 * @route   DELETE /api/v1/records/:recordId
 * @desc    Delete (soft delete) financial record
 * @access  Private (Owner or Admin)
 */
router.delete(
  '/:recordId',
  authenticate,
  requirePermission('records:delete'),
  RecordController.deleteRecord
);

module.exports = router;
