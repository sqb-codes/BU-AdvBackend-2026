const AppError = require("../utils/AppError");

function errorHandler(error, _req, res, _next) {
  let normalizedError = error;

  if (error?.type === "entity.parse.failed" || error instanceof SyntaxError) {
    normalizedError = new AppError(400, "Request body contains invalid JSON.");
  } else if (error?.code === 11000) {
    normalizedError = new AppError(409, "An account with that email address already exists.");
  } else if (error?.name === "ValidationError") {
    normalizedError = new AppError(400, "User data failed validation.");
  } else if (error?.name === "CastError") {
    normalizedError = new AppError(400, "A supplied value is invalid.");
  } else if (!(error instanceof AppError)) {
    console.error(error);
    normalizedError = new AppError(500, "An unexpected error occurred.");
  }

  res.status(normalizedError.statusCode).json({
    error: {
      message: normalizedError.message,
    },
  });
}

module.exports = errorHandler;
