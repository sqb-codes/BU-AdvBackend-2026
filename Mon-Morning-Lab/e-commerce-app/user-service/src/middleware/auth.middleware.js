const jwt = require("jsonwebtoken");
const { getConfig } = require("../../config/env");
const User = require("../models/user.model");
const ApiError = require("../utils/api-error");

async function authenticateToken(req, res, next) {
    const authorization = req.get("authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
        return next(new ApiError(401, "A bearer token is required", "AUTHENTICATION_REQUIRED"));
    }

    let payload;
    try {
        payload = jwt.verify(authorization.slice(7), getConfig().jwtSecret);
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return next(new ApiError(401, "The access token is invalid or expired", "INVALID_TOKEN"));
        }
        return next(error);
    }

    if (typeof payload === "string" || typeof payload.sub !== "string") {
        return next(new ApiError(401, "The access token is invalid", "INVALID_TOKEN"));
    }

    try {
        const user = await User.findById(payload.sub);
        if (!user || !user.isActive) {
            return next(new ApiError(401, "The user account is unavailable", "INVALID_TOKEN"));
        }
        req.authUser = user;
        return next();
    } catch (error) {
        return next(error);
    }
}

function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.authUser || !roles.includes(req.authUser.role)) {
            return next(new ApiError(403, "You do not have permission to perform this action", "FORBIDDEN"));
        }
        return next();
    };
}

function authorizeSelfOrAdmin(req, res, next) {
    if (req.authUser?.role === "admin" || req.authUser?.id === req.params.id) {
        return next();
    }
    return next(new ApiError(403, "You can only access your own user record", "FORBIDDEN"));
}

module.exports = { authenticateToken, authorizeRoles, authorizeSelfOrAdmin };
