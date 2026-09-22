const { body } = require('express-validator');
const { handleValidationErrors } = require('./authValidator');

/**
 * Validation for creating an order.
 * Requires a non-empty items array, each with a valid productId and
 * a positive integer quantity.
 */
const createOrderValidator = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),

  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required for each item')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required for each item')
    .isInt({ gt: 0 })
    .withMessage('Quantity must be a positive integer'),

  handleValidationErrors,
];

module.exports = { createOrderValidator };