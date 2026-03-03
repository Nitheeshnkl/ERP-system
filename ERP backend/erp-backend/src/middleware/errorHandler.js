const { error: errorResponse } = require('../utils/response');

const notFoundHandler = (req, res, _next) => {
  return errorResponse(res, `Route not found: ${req.originalUrl}`, 404);
};

const resolveErrorStatus = (err) => {
  if (err.status || err.statusCode) {
    return err.status || err.statusCode;
  }

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return 400;
  }

  if (Number(err.code) === 11000) {
    return 400;
  }

  return 500;
};

const resolveErrorMessage = (err, status) => {
  if (Number(err.code) === 11000) {
    const fields = Object.keys(err.keyPattern || err.keyValue || {});
    const fieldName = fields.length ? fields.join(', ') : 'resource';
    return `Duplicate value for ${fieldName}`;
  }

  if (status === 400 && err.name === 'ValidationError' && err.errors) {
    return Object.values(err.errors)
      .map((item) => item.message)
      .filter(Boolean)
      .join(', ') || err.message;
  }

  return err.message || 'Internal server error';
};

const errorHandler = (err, req, res, _next) => {
  const status = resolveErrorStatus(err);
  const isProd = process.env.NODE_ENV === 'production';
  const message = isProd && status >= 500 ? 'Internal server error' : resolveErrorMessage(err, status);

  if (process.env.NODE_ENV !== 'test') {
    // Keep logs concise but actionable for ops troubleshooting
    console.error('Unhandled error:', {
      method: req.method,
      path: req.originalUrl,
      status,
      message: err.message,
    });
  }

  return errorResponse(res, message, status);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
