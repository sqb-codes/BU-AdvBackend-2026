// Responsible for
// 1. Express initialization
// 2. Middleware
// 3. Routes

const express = require("express");
const urlRoutes = require("./routes/url.routes");
require("dotenv").config();

const app = express();

// Parse JSON request bodies
app.use(express.json())

// Register Routes
app.use("/api/url", urlRoutes);

// Error Handler
const errorMiddleware = require("./middlewares/error.middleware");
app.use(errorMiddleware);

module.exports = app;