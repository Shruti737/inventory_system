const { body } = require('express-validator');
const { handleValidationErrors } = require('./authValidator');

/**
 * Validation for creating a product.
 * All main fields are required.
 */
const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Product name must be at most 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be at most 2000 characters'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number'),

  body('stockQuantity')
    .notEmpty()
    .withMessage('Stock quantity is required')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),

  handleValidationErrors,
];

/**
 * Validation for updating a product.
 * Only validates the fields that are actually provided (partial update).
 */
const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Product name must be at most 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be at most 2000 characters'),

  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number'),

  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),

  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),

  handleValidationErrors,
];

module.exports = { createProductValidator, updateProductValidator };