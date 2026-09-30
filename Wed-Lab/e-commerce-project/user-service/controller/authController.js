const User = require("../model/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  allowOnlyFields,
  requireObjectBody,
  validateEmail,
  validateName,
  validatePassword,
} = require("../utils/validation");
const { createAccessToken } = require("../middlewares/auth");

const register = asyncHandler(async (req, res) => {
  const body = requireObjectBody(req.body);
  allowOnlyFields(body, ["name", "email", "password"]);

  const user = await User.create({
    name: validateName(body.name),
    email: validateEmail(body.email),
    password: validatePassword(body.password),
  });

  res.status(201).json({
    data: { user, accessToken: createAccessToken(user), tokenType: "Bearer" },
  });
});

const login = asyncHandler(async (req, res) => {
  const body = requireObjectBody(req.body);
  allowOnlyFields(body, ["email", "password"]);

  const email = validateEmail(body.email);
  if (typeof body.password !== "string" || body.password.length === 0) {
    throw new AppError(400, "Password is required.");
  }

  const user = await User.findOne({ email }).select("+password +tokenVersion");
  if (!user || !(await user.comparePassword(body.password))) {
    throw new AppError(401, "Invalid email or password.");
  }

  res.json({
    data: { user, accessToken: createAccessToken(user), tokenType: "Bearer" },
  });
});

module.exports = { login, register };
