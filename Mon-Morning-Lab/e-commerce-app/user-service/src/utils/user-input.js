const ApiError = require("./api-error");

const BASE_FIELDS = ["name", "email", "password"];

function validateUserInput(body, { allowRole = false, allowIsActive = false, partial = false } = {}) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new ApiError(400, "Request body must be a JSON object", "INVALID_BODY");
    }

    const allowedFields = [...BASE_FIELDS];
    if (allowRole) allowedFields.push("role");
    if (allowIsActive) allowedFields.push("isActive");

    const unknownFields = Object.keys(body).filter((field) => !allowedFields.includes(field));
    if (unknownFields.length > 0) {
        throw new ApiError(400, `Unsupported field: ${unknownFields[0]}`, "INVALID_FIELD");
    }

    if (!partial && (!body.name || !body.email || !body.password)) {
        throw new ApiError(400, "name, email, and password are required", "MISSING_FIELDS");
    }
    if (partial && Object.keys(body).length === 0) {
        throw new ApiError(400, "At least one field must be provided", "EMPTY_UPDATE");
    }

    const update = {};
    if (Object.hasOwn(body, "name")) {
        if (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.trim().length > 80) {
            throw new ApiError(400, "name must be a string between 2 and 80 characters", "INVALID_NAME");
        }
        update.name = body.name.trim();
    }

    if (Object.hasOwn(body, "email")) {
        if (typeof body.email !== "string" || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
            throw new ApiError(400, "email must be a valid email address", "INVALID_EMAIL");
        }
        update.email = body.email.trim().toLowerCase();
    }

    if (Object.hasOwn(body, "password")) {
        if (typeof body.password !== "string" || body.password.length < 8 || Buffer.byteLength(body.password, "utf8") > 72) {
            throw new ApiError(400, "password must be between 8 and 72 bytes", "INVALID_PASSWORD");
        }
        update.password = body.password;
    }

    if (Object.hasOwn(body, "role")) {
        if (!allowRole) {
            throw new ApiError(400, "Unsupported field: role", "INVALID_FIELD");
        }
        if (!["user", "admin"].includes(body.role)) {
            throw new ApiError(400, "role must be either user or admin", "INVALID_ROLE");
        }
        update.role = body.role;
    }

    if (Object.hasOwn(body, "isActive")) {
        if (!allowIsActive) {
            throw new ApiError(400, "Unsupported field: isActive", "INVALID_FIELD");
        }
        if (typeof body.isActive !== "boolean") {
            throw new ApiError(400, "isActive must be a boolean", "INVALID_STATUS");
        }
        update.isActive = body.isActive;
    }

    return update;
}

module.exports = { validateUserInput };
