const AppError = require("./AppError");

function requireObjectBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError(400, "Request body must be a JSON object.");
  }
  return body;
}

function allowOnlyFields(body, allowedFields) {
  const unknownFields = Object.keys(body).filter(
    (field) => !allowedFields.includes(field),
  );
  if (unknownFields.length > 0) {
    throw new AppError(
      400,
      `Unsupported field(s): ${unknownFields.join(", ")}.`,
    );
  }
}

function validateName(name) {
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
    throw new AppError(400, "Name must be between 2 and 80 characters.");
  }
  return name.trim();
}

function validateEmail(email) {
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    throw new AppError(400, "A valid email address is required.");
  }
  return email.trim().toLowerCase();
}

function validatePassword(password) {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    throw new AppError(400, "Password must be at least 8 characters and at most 72 bytes.");
  }
  return password;
}

function validateRole(role) {
  if (!["user", "admin"].includes(role)) {
    throw new AppError(400, "Role must be either 'user' or 'admin'.");
  }
  return role;
}

module.exports = {
  allowOnlyFields,
  requireObjectBody,
  validateEmail,
  validateName,
  validatePassword,
  validateRole,
};
