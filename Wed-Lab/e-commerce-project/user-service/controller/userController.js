const mongoose = require("mongoose");
const User = require("../model/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { createAccessToken } = require("../middlewares/auth");
const {
  allowOnlyFields,
  requireObjectBody,
  validateEmail,
  validateName,
  validatePassword,
  validateRole,
} = require("../utils/validation");

function requireUserId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "User ID is invalid.");
  }
}

function parsePositiveInteger(value, field, maximum) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new AppError(400, `${field} must be an integer between 1 and ${maximum}.`);
  }
  return parsed;
}

const createUser = asyncHandler(async (req, res) => {
  const body = requireObjectBody(req.body);
  allowOnlyFields(body, ["name", "email", "password", "role"]);

  const user = await User.create({
    name: validateName(body.name),
    email: validateEmail(body.email),
    password: validatePassword(body.password),
    ...(body.role !== undefined ? { role: validateRole(body.role) } : {}),
  });

  res.status(201).json({ data: { user } });
});

const listUsers = asyncHandler(async (req, res) => {
  const allowedQuery = ["page", "limit", "role", "search"];
  const unsupportedQuery = Object.keys(req.query).filter(
    (key) => !allowedQuery.includes(key),
  );
  if (unsupportedQuery.length > 0) {
    throw new AppError(400, `Unsupported query parameter(s): ${unsupportedQuery.join(", ")}.`);
  }

  const page = req.query.page === undefined
    ? 1
    : parsePositiveInteger(req.query.page, "page", Number.MAX_SAFE_INTEGER);
  const limit = req.query.limit === undefined
    ? 20
    : parsePositiveInteger(req.query.limit, "limit", 100);
  const filter = {};

  if (req.query.role !== undefined) {
    filter.role = validateRole(req.query.role);
  }
  if (req.query.search !== undefined) {
    if (typeof req.query.search !== "string" || req.query.search.length > 80) {
      throw new AppError(400, "Search must be at most 80 characters.");
    }
    const escapedSearch = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { email: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    data: users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const getUser = asyncHandler(async (req, res) => {
  requireUserId(req.params.userId);
  if (req.auth.role !== "admin" && req.auth.userId !== req.params.userId) {
    throw new AppError(403, "You may only view your own account.");
  }

  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new AppError(404, "User not found.");
  }
  res.json({ data: { user } });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.auth.userId);
  if (!user) {
    throw new AppError(404, "User not found.");
  }
  res.json({ data: { user } });
});

const updateUser = asyncHandler(async (req, res) => {
  requireUserId(req.params.userId);
  const body = requireObjectBody(req.body);
  allowOnlyFields(body, ["name", "email", "password", "role"]);
  if (Object.keys(body).length === 0) {
    throw new AppError(400, "At least one field must be provided.");
  }

  const user = await User.findById(req.params.userId).select("+tokenVersion");
  if (!user) {
    throw new AppError(404, "User not found.");
  }

  if (body.name !== undefined) user.name = validateName(body.name);
  if (body.email !== undefined) user.email = validateEmail(body.email);
  if (body.password !== undefined) user.password = validatePassword(body.password);
  if (body.role !== undefined) user.role = validateRole(body.role);
  await user.save();

  res.json({ data: { user } });
});

const updateCurrentUser = asyncHandler(async (req, res) => {
  const body = requireObjectBody(req.body);
  allowOnlyFields(body, ["name", "email", "currentPassword", "newPassword"]);
  if (Object.keys(body).length === 0) {
    throw new AppError(400, "At least one field must be provided.");
  }

  const user = await User.findById(req.auth.userId).select("+password +tokenVersion");
  if (!user) {
    throw new AppError(404, "User not found.");
  }

  if (body.name !== undefined) user.name = validateName(body.name);
  if (body.email !== undefined) user.email = validateEmail(body.email);

  const changingPassword =
    body.currentPassword !== undefined || body.newPassword !== undefined;
  if (changingPassword) {
    if (typeof body.currentPassword !== "string" || typeof body.newPassword !== "string") {
      throw new AppError(400, "Both currentPassword and newPassword are required to change password.");
    }
    if (!(await user.comparePassword(body.currentPassword))) {
      throw new AppError(401, "Current password is incorrect.");
    }
    user.password = validatePassword(body.newPassword);
  }

  await user.save();
  res.json({
    data: {
      user,
      ...(changingPassword
        ? { accessToken: createAccessToken(user), tokenType: "Bearer" }
        : {}),
    },
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  requireUserId(req.params.userId);
  const user = await User.findByIdAndDelete(req.params.userId);
  if (!user) {
    throw new AppError(404, "User not found.");
  }
  res.status(204).end();
});

const deleteCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.auth.userId);
  if (!user) {
    throw new AppError(404, "User not found.");
  }
  res.status(204).end();
});

module.exports = {
  createUser,
  deleteCurrentUser,
  deleteUser,
  getCurrentUser,
  getUser,
  listUsers,
  updateCurrentUser,
  updateUser,
};
