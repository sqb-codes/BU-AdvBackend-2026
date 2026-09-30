const jwt = require("jsonwebtoken");
const User = require("../model/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const TOKEN_ISSUER = "user-service";
const TOKEN_AUDIENCE = "user-service-api";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }
  return secret;
}

function createAccessToken(user) {
  return jwt.sign(
    { ver: user.tokenVersion },
    getJwtSecret(),
    {
      algorithm: "HS256",
      audience: TOKEN_AUDIENCE,
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      issuer: TOKEN_ISSUER,
      subject: user.id,
    },
  );
}

const authenticate = asyncHandler(async (req, _res, next) => {
  const authorization = req.get("authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    throw new AppError(401, "Authentication is required.");
  }

  const secret = getJwtSecret();
  let payload;
  try {
    payload = jwt.verify(match[1], secret, {
      algorithms: ["HS256"],
      audience: TOKEN_AUDIENCE,
      issuer: TOKEN_ISSUER,
    });
  } catch (_error) {
    throw new AppError(401, "Access token is invalid or expired.");
  }

  if (
    typeof payload === "string" ||
    typeof payload.sub !== "string" ||
    !Number.isInteger(payload.ver)
  ) {
    throw new AppError(401, "Access token is invalid or expired.");
  }

  const user = await User.findById(payload.sub).select("+tokenVersion");
  if (!user || user.tokenVersion !== payload.ver) {
    throw new AppError(401, "Access token is invalid or expired.");
  }

  req.auth = { userId: user.id, role: user.role };
  next();
});

function authorizeRoles(...roles) {
  return function roleAuthorization(req, _res, next) {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return next(new AppError(403, "You do not have permission to perform this action."));
    }
    next();
  };
}

module.exports = { authenticate, authorizeRoles, createAccessToken, getJwtSecret };
