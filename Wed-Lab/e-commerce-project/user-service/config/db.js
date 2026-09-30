const mongoose = require("mongoose");

function getMongoUri() {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const database = process.env.MONGODB_DATABASE_NAME || "user_service";
  const host = process.env.MONGODB_HOST || "localhost";
  const port = process.env.MONGODB_PORT || "27017";
  const username = process.env.MONGODB_USERNAME;
  const password = process.env.MONGODB_PASSWORD;

  if (Boolean(username) !== Boolean(password)) {
    throw new Error("Set both MONGODB_USERNAME and MONGODB_PASSWORD.");
  }

  const credentials = username
    ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
    : "";
  const authSource = username
    ? `?authSource=${encodeURIComponent(process.env.MONGODB_AUTH_SOURCE || "admin")}`
    : "";

  return `mongodb://${credentials}${host}:${port}/${database}${authSource}`;
}

async function connectDB() {
  await mongoose.connect(getMongoUri());
  console.log("MongoDB connected successfully");
}

module.exports = connectDB;
