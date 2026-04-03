/**
 * Joi Validation Schemas
 */

const Joi = require('joi');

// User Validation Schemas
const userValidationSchemas = {
  register: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required(),
    fullName: Joi.string().min(2).required(),
    role: Joi.string().valid('admin', 'analyst', 'viewer').default('viewer')
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required()
  }),

  updateUser: Joi.object({
    fullName: Joi.string().min(2),
    email: Joi.string().email().lowercase(),
    role: Joi.string().valid('admin', 'analyst', 'viewer'),
    status: Joi.string().valid('active', 'inactive', 'suspended'),
    metadata: Joi.object({
      department: Joi.string(),
      phone: Joi.string(),
      avatar: Joi.string().uri()
    })
  }).min(1),

  changePassword: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  })
};

// Financial Record Validation Schemas
const recordValidationSchemas = {
  create: Joi.object({
    amount: Joi.number().positive().required(),
    type: Joi.string().valid('income', 'expense').required(),
    category: Joi.string()
      .valid(
        'salary',
        'freelance',
        'investment',
        'other_income',
        'food',
        'transport',
        'utilities',
        'entertainment',
        'healthcare',
        'education',
        'rent',
        'other_expense'
      )
      .required(),
    description: Joi.string().max(500),
    date: Joi.date().iso().default(() => new Date()),
    tags: Joi.array().items(Joi.string()),
    isRecurring: Joi.boolean().default(false),
    recurringPattern: Joi.string()
      .valid('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')
      .when('isRecurring', {
        is: true,
        then: Joi.required()
      }),
    metadata: Joi.object({
      paymentMethod: Joi.string(),
      vendor: Joi.string(),
      reference: Joi.string()
    })
  }),

  update: Joi.object({
    amount: Joi.number().positive(),
    type: Joi.string().valid('income', 'expense'),
    category: Joi.string().valid(
      'salary',
      'freelance',
      'investment',
      'other_income',
      'food',
      'transport',
      'utilities',
      'entertainment',
      'healthcare',
      'education',
      'rent',
      'other_expense'
    ),
    description: Joi.string().max(500),
    date: Joi.date().iso(),
    tags: Joi.array().items(Joi.string()),
    isRecurring: Joi.boolean(),
    recurringPattern: Joi.string().valid('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'),
    metadata: Joi.object({
      paymentMethod: Joi.string(),
      vendor: Joi.string(),
      reference: Joi.string()
    })
  }).min(1),

  query: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    category: Joi.string(),
    type: Joi.string().valid('income', 'expense'),
    tags: Joi.array().items(Joi.string()),
    sortBy: Joi.string().valid('date', 'amount', 'category'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  })
};

// Query Validation Schema
const queryValidationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  userValidationSchemas,
  recordValidationSchemas,
  queryValidationSchema
};
