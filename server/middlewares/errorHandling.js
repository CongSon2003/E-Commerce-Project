const { StatusCodes } = require('http-status-codes')
// Error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  // Kiểm tra xem có status code error không nếu có thì code : 500
  if (!err.statusCode) {
    err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
  const statusCode = err.statusCode;
  res.status(statusCode).json({
    success : false,
    message : err.message || 'An unexpected error occurred'
  });
}
const errNotFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`)
  error.statusCode = StatusCodes.NOT_FOUND
  next(error)
}
module.exports = { globalErrorHandler, errNotFound }