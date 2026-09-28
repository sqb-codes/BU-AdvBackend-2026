const User = require("../models/user.model");
const ApiError = require("../utils/api-error");
const { validateUserInput } = require("../utils/user-input");
const { createAccessToken } = require("../services/auth.service");

async function register(req, res) {
    const userInput = validateUserInput(req.body);
    const user = await User.create(userInput);
    const token = createAccessToken(user);

    res.status(201).json({ success: true, data: { user, token } });
}

async function login(req, res) {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new ApiError(400, "Request body must be a JSON object", "INVALID_BODY");
    }
    const unsupportedField = Object.keys(body).find((field) => !["email", "password"].includes(field));
    if (unsupportedField) {
        throw new ApiError(400, `Unsupported field: ${unsupportedField}`, "INVALID_FIELD");
    }
    if (typeof body.email !== "string" || typeof body.password !== "string") {
        throw new ApiError(400, "email and password are required", "MISSING_FIELDS");
    }
    if (body.email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
        throw new ApiError(400, "email must be a valid email address", "INVALID_EMAIL");
    }
    if (Buffer.byteLength(body.password, "utf8") > 72) {
        throw new ApiError(400, "password must be at most 72 bytes", "INVALID_PASSWORD");
    }

    const user = await User.findOne({ email: body.email.trim().toLowerCase() }).select("+password");
    if (!user || !user.isActive || !(await user.comparePassword(body.password))) {
        throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    res.status(200).json({ success: true, data: { user, token: createAccessToken(user) } });
}

function getCurrentUser(req, res) {
    res.status(200).json({ success: true, data: { user: req.authUser } });
}

module.exports = { getCurrentUser, login, register };
