/**
 * Financial Record Controller
 * Handles HTTP requests for financial record operations
 */

const FinancialRecordService = require('../services/FinancialRecordService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Create new financial record
 * POST /api/v1/records
 */
const createRecord = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const recordData = req.validatedBody;

  const record = await FinancialRecordService.createRecord(userId, recordData);

  logger.info('Financial record created', { userId, recordId: record._id });

  res.status(201).json({
    success: true,
    message: 'Record created successfully',
    data: record
  });
});

/**
 * Get all records for user with filters
 * GET /api/v1/records
 */
const getRecords = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const filters = req.validatedQuery;

  const result = await FinancialRecordService.getRecords(userId, filters);

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

/**
 * Get single record by ID
 * GET /api/v1/records/:recordId
 */
const getRecordById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { recordId } = req.params;

  const record = await FinancialRecordService.getRecordById(recordId, userId);

  res.status(200).json({
    success: true,
    data: record
  });
});

/**
 * Update financial record
 * PUT /api/v1/records/:recordId
 */
const updateRecord = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { recordId } = req.params;
  const updateData = req.validatedBody;

  const record = await FinancialRecordService.updateRecord(recordId, userId, updateData);

  logger.info('Financial record updated', { userId, recordId });

  res.status(200).json({
    success: true,
    message: 'Record updated successfully',
    data: record
  });
});

/**
 * Delete financial record (soft delete)
 * DELETE /api/v1/records/:recordId
 */
const deleteRecord = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { recordId } = req.params;

  await FinancialRecordService.deleteRecord(recordId, userId);

  logger.info('Financial record deleted', { userId, recordId });

  res.status(200).json({
    success: true,
    message: 'Record deleted successfully'
  });
});

/**
 * Get dashboard summary
 * GET /api/v1/dashboard/summary
 */
const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;

  const summary = await FinancialRecordService.getSummary(userId, {
    startDate,
    endDate
  });

  res.status(200).json({
    success: true,
    data: summary
  });
});

/**
 * Get monthly trends
 * GET /api/v1/dashboard/trends
 */
const getMonthlyTrends = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { months = 12 } = req.query;

  const trends = await FinancialRecordService.getMonthlyTrends(userId, parseInt(months));

  res.status(200).json({
    success: true,
    data: trends
  });
});

/**
 * Get category breakdown
 * GET /api/v1/dashboard/categories
 */
const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;

  const breakdown = await FinancialRecordService.getCategoryBreakdown(userId, {
    startDate,
    endDate
  });

  res.status(200).json({
    success: true,
    data: breakdown
  });
});

/**
 * Get recent transactions
 * GET /api/v1/dashboard/recent
 */
const getRecentTransactions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 10 } = req.query;

  const transactions = await FinancialRecordService.getRecentTransactions(
    userId,
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: transactions
  });
});

/**
 * Export records
 * GET /api/v1/records/export
 */
const exportRecords = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const filters = req.query;

  const records = await FinancialRecordService.exportRecords(userId, filters);

  // Set headers for CSV download
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="financial-records.json"');

  res.status(200).json({
    success: true,
    data: records,
    count: records.length,
    exportedAt: new Date().toISOString()
  });
});

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getSummary,
  getMonthlyTrends,
  getCategoryBreakdown,
  getRecentTransactions,
  exportRecords
};
