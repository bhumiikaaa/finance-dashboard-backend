/**
 * Financial Record Service Layer
 * Business logic for financial record operations
 */

const FinancialRecord = require('../models/FinancialRecord');
const { NotFoundError, ValidationError } = require('../utils/errors');

class FinancialRecordService {
  /**
   * Create a new financial record
   * @param {string} userId - User ID
   * @param {Object} recordData - Record data
   * @returns {Promise<Object>} Created record
   */
  async createRecord(userId, recordData) {
    const record = new FinancialRecord({
      ...recordData,
      userId,
      createdBy: userId
    });

    await record.save();
    return record.populate('userId', 'fullName email');
  }

  /**
   * Get all records for a user with filters
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Paginated records
   */
  async getRecords(userId, filters = {}) {
    const {
      startDate,
      endDate,
      category,
      type,
      tags,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = filters;

    // Build query
    const query = { userId, isDeleted: false };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (category) query.category = category;
    if (type) query.type = type;
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Calculate skip and limit
    const skip = (page - 1) * limit;

    // Execute query
    const records = await FinancialRecord.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const total = await FinancialRecord.countDocuments(query);

    return {
      data: records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single record by ID
   * @param {string} recordId - Record ID
   * @param {string} userId - User ID (for ownership check)
   * @returns {Promise<Object>} Record document
   */
  async getRecordById(recordId, userId) {
    const record = await FinancialRecord.findOne({
      _id: recordId,
      userId,
      isDeleted: false
    });

    if (!record) {
      throw new NotFoundError('Financial Record');
    }

    return record;
  }

  /**
   * Update a financial record
   * @param {string} recordId - Record ID
   * @param {string} userId - User ID (for ownership check)
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated record
   */
  async updateRecord(recordId, userId, updateData) {
    const record = await FinancialRecord.findOneAndUpdate(
      { _id: recordId, userId, isDeleted: false },
      { ...updateData, updatedBy: userId },
      { new: true, runValidators: true }
    );

    if (!record) {
      throw new NotFoundError('Financial Record');
    }

    return record;
  }

  /**
   * Delete a financial record (soft delete)
   * @param {string} recordId - Record ID
   * @param {string} userId - User ID (for ownership check)
   * @returns {Promise<void>}
   */
  async deleteRecord(recordId, userId) {
    const record = await FinancialRecord.findOneAndUpdate(
      { _id: recordId, userId, isDeleted: false },
      { isDeleted: true, updatedBy: userId },
      { new: true }
    );

    if (!record) {
      throw new NotFoundError('Financial Record');
    }
  }

  /**
   * Get summary analytics for a user
   * @param {string} userId - User ID
   * @param {Object} options - Options (startDate, endDate)
   * @returns {Promise<Object>} Summary data
   */
  async getSummary(userId, { startDate, endDate } = {}) {
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const summary = await FinancialRecord.getSummary(userId, start, end);

    return {
      period: {
        startDate: start,
        endDate: end
      },
      ...summary
    };
  }

  /**
   * Get monthly trends
   * @param {string} userId - User ID
   * @param {number} months - Number of months to analyze
   * @returns {Promise<Array>} Trends data
   */
  async getMonthlyTrends(userId, months = 12) {
    return await FinancialRecord.getMonthlyTrends(userId, months);
  }

  /**
   * Get category breakdown
   * @param {string} userId - User ID
   * @param {Object} options - Options (startDate, endDate)
   * @returns {Promise<Object>} Category breakdown
   */
  async getCategoryBreakdown(userId, { startDate, endDate } = {}) {
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const records = await FinancialRecord.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId(userId),
          date: { $gte: start, $lte: end },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          type: { $first: '$type' }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    return {
      period: {
        startDate: start,
        endDate: end
      },
      data: records.map(record => ({
        category: record._id,
        total: record.total,
        count: record.count,
        type: record.type
      }))
    };
  }

  /**
   * Get recent transactions
   * @param {string} userId - User ID
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} Recent records
   */
  async getRecentTransactions(userId, limit = 10) {
    return await FinancialRecord.find({
      userId,
      isDeleted: false
    })
      .sort({ date: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  /**
   * Export records (for admin or resource owner)
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Records for export
   */
  async exportRecords(userId, filters = {}) {
    const query = { userId, isDeleted: false };

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }

    if (filters.category) query.category = filters.category;
    if (filters.type) query.type = filters.type;

    return await FinancialRecord.find(query)
      .sort({ date: -1 })
      .lean()
      .exec();
  }
}

module.exports = new FinancialRecordService();
