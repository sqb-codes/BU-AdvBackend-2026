const ApiError = require("../utils/api-error");

function notFound(req, res, next) {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, "ROUTE_NOT_FOUND"));
}

function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    let statusCode = error.statusCode || error.status || 500;
    let message = error.message || "Internal server error";
    let code = error.code || "INTERNAL_SERVER_ERROR";
    let details;

    if (error.name === "ValidationError") {
        statusCode = 400;
        code = "VALIDATION_ERROR";
        details = Object.values(error.errors).map(({ path, message: fieldMessage }) => ({ field: path, message: fieldMessage }));
        message = "Request validation failed";
    } else if (error.code === 11000) {
        statusCode = 409;
        code = "DUPLICATE_RESOURCE";
        message = "A user with this email already exists";
    } else if (error.name === "CastError") {
        statusCode = 400;
        code = "INVALID_ID";
        message = `Invalid ${error.path}`;
    } else if (error.type === "entity.parse.failed") {
        statusCode = 400;
        code = "INVALID_JSON";
        message = "Request body contains invalid JSON";
    }

    if (statusCode >= 500) {
        console.error("User-service request failed:", error);
        message = "Internal server error";
    }

    const response = { success: false, error: { code, message } };
    if (details) response.error.details = details;
    return res.status(statusCode).json(response);
}

module.exports = { errorHandler, notFound };
