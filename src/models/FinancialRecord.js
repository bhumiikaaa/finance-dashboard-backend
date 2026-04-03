/**
 * Financial Record Model
 * Represents financial transactions (income/expense)
 */

const mongoose = require('mongoose');
const { RECORD_TYPES, CATEGORIES } = require('../constants/roles');

const financialRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be a positive number'],
      validate: {
        validator: function (v) {
          return Number.isFinite(v) && v > 0;
        },
        message: 'Amount must be a valid positive number'
      }
    },

    type: {
      type: String,
      enum: Object.values(RECORD_TYPES),
      required: [true, 'Type (income/expense) is required']
    },

    category: {
      type: String,
      enum: Object.values(CATEGORIES),
      required: [true, 'Category is required']
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },

    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now,
      index: true
    },

    tags: [
      {
        type: String,
        trim: true
      }
    ],

    isRecurring: {
      type: Boolean,
      default: false
    },

    recurringPattern: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']
    },

    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    metadata: {
      paymentMethod: String,
      vendor: String,
      reference: String
    },

    // Audit trail
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index for efficient querying by user and date
financialRecordSchema.index({ userId: 1, date: -1 });
financialRecordSchema.index({ userId: 1, type: 1, date: -1 });
financialRecordSchema.index({ userId: 1, category: 1 });

// Virtual for month-year grouping
financialRecordSchema.virtual('monthYear').get(function () {
  return this.date.toISOString().slice(0, 7);
});

// Static method to get summary by user
financialRecordSchema.statics.getSummary = async function (userId, startDate, endDate) {
  const records = await this.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
    isDeleted: false
  });

  const summary = {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    byCategory: {},
    byType: {}
  };

  records.forEach((record) => {
    if (record.type === RECORD_TYPES.INCOME) {
      summary.totalIncome += record.amount;
    } else {
      summary.totalExpense += record.amount;
    }

    if (!summary.byCategory[record.category]) {
      summary.byCategory[record.category] = { income: 0, expense: 0, total: 0 };
    }
    summary.byCategory[record.category][record.type] += record.amount;
    summary.byCategory[record.category].total += record.amount;

    if (!summary.byType[record.type]) {
      summary.byType[record.type] = 0;
    }
    summary.byType[record.type] += record.amount;
  });

  summary.netBalance = summary.totalIncome - summary.totalExpense;

  return summary;
};

// Static method for monthly trends
financialRecordSchema.statics.getMonthlyTrends = async function (userId, months = 12) {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - months);

  const records = await this.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
    isDeleted: false
  });

  const trends = {};

  records.forEach((record) => {
    const monthKey = record.monthYear;
    if (!trends[monthKey]) {
      trends[monthKey] = { income: 0, expense: 0 };
    }
    if (record.type === RECORD_TYPES.INCOME) {
      trends[monthKey].income += record.amount;
    } else {
      trends[monthKey].expense += record.amount;
    }
  });

  return Object.entries(trends)
    .map(([month, values]) => ({
      month,
      ...values,
      net: values.income - values.expense
    }))
    .sort((a, b) => new Date(a.month) - new Date(b.month));
};

module.exports = mongoose.model('FinancialRecord', financialRecordSchema);
