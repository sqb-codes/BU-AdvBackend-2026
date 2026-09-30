require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/db");
const { getJwtSecret } = require("./middlewares/auth");

async function startServer() {
  getJwtSecret();
  await connectDB();

  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, () => {
    console.log(`User service listening on port ${port}`);
  });

  async function shutdown(signal) {
    console.log(`${signal} received; shutting down user service`);
    server.close(async (error) => {
      if (error) {
        console.error("HTTP server shutdown failed:", error);
        process.exitCode = 1;
      }
      await mongoose.disconnect();
    });
  }

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error) => {
  console.error("User service startup failed:", error);
  process.exitCode = 1;
});
