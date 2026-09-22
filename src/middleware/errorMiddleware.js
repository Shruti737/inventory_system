/**
 * 404 handler for unmatched routes.
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Centralized error handling middleware.
 * Converts known errors into clean, consistent JSON responses and
 * hides internal database details from the client.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Errors explicitly thrown by controllers with a status code.
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Sequelize unique constraint (e.g. duplicate email).
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors && err.errors[0] ? err.errors[0].path : 'field';
    return res.status(409).json({
      success: false,
      message: `${field} already exists.`,
    });
  }

  // Sequelize validation errors.
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Generic database errors – do not leak internals.
  if (err.name && err.name.startsWith('Sequelize')) {
    return res.status(400).json({
      success: false,
      message: 'Database error. Please check your request.',
    });
  }

  // Invalid JSON body.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body.',
    });
  }

  // Fallback: unexpected server error.
  console.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error.',
  });
};

module.exports = { notFound, errorHandler };