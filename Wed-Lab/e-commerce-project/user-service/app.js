const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/AppError");

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

app.get("/health", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    database: connected ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use((_req, _res, next) => {
  next(new AppError(404, "Route not found."));
});
app.use(errorHandler);

module.exports = app;
