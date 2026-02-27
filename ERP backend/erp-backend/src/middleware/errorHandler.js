const { error: errorResponse } = require('../utils/response');

const notFoundHandler = (req, res, _next) => {
  return errorResponse(res, `Route not found: ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';
  const message = isProd && status >= 500 ? 'Internal server error' : (err.message || 'Internal server error');

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
