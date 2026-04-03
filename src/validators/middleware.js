/**
 * Validation Middleware
 * Validates request data against predefined schemas
 */

const { ValidationError } = require('../utils/errors');

/**
 * Validate request body against a schema
 * @param {Object} schema - Joi schema to validate against
 * @returns {Function} Middleware function
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.reduce((acc, err) => {
        acc[err.path.join('.')] = err.message;
        return acc;
      }, {});

      return next(new ValidationError('Validation failed', details));
    }

    req.validatedBody = value;
    next();
  };
};

/**
 * Validate request query against a schema
 * @param {Object} schema - Joi schema to validate against
 * @returns {Function} Middleware function
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.reduce((acc, err) => {
        acc[err.path.join('.')] = err.message;
        return acc;
      }, {});

      return next(new ValidationError('Validation failed', details));
    }

    req.validatedQuery = value;
    next();
  };
};

/**
 * Validate request params against a schema
 * @param {Object} schema - Joi schema to validate against
 * @returns {Function} Middleware function
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false
    });

    if (error) {
      const details = error.details.reduce((acc, err) => {
        acc[err.path.join('.')] = err.message;
        return acc;
      }, {});

      return next(new ValidationError('Validation failed', details));
    }

    req.validatedParams = value;
    next();
  };
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams
};
