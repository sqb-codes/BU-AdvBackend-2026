const express = require("express");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const { errorHandler, notFound } = require("./middleware/error.middleware");

function createApp() {
    const app = express();

    app.disable("x-powered-by");
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: false, limit: "1mb" }));

    app.get("/health", (req, res) => {
        res.status(200).json({ success: true, data: { service: "user-service" } });
    });
    app.use("/api/v1/auth", authRoutes);
    app.use("/api/v1/users", userRoutes);
    app.use(notFound);
    app.use(errorHandler);

    return app;
}

module.exports = createApp;
