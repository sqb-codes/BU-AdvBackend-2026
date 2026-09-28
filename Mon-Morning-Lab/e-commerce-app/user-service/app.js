require("dotenv").config();

const mongoose = require("mongoose");
const { getConfig } = require("./config/env");
const connectDB = require("./config/db");
const { bootstrapAdmin } = require("./src/services/auth.service");
const createApp = require("./src/app");

async function startServer() {
    const config = getConfig();
    await connectDB(config.mongodbUri);
    await bootstrapAdmin();

    const app = createApp();
    const server = app.listen(config.port, () => {
        console.log(`User service listening on port ${config.port}`);
    });

    const shutdown = (signal) => {
        console.log(`${signal} received; shutting down user service`);
        server.close(async (error) => {
            if (error) {
                console.error("Error while closing the HTTP server:", error);
                process.exitCode = 1;
            }

            try {
                await mongoose.disconnect();
            } catch (disconnectError) {
                console.error("Error while disconnecting from MongoDB:", disconnectError);
                process.exitCode = 1;
            }
        });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
}

if (require.main === module) {
    startServer().catch(async (error) => {
        console.error("Unable to start user service:", error);
        try {
            await mongoose.disconnect();
        } catch (disconnectError) {
            console.error("Error while disconnecting from MongoDB:", disconnectError);
        }
        process.exitCode = 1;
    });
}

module.exports = startServer;
