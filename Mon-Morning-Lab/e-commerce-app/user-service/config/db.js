const mongoose = require("mongoose");

async function connectDB(uri) {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
}

module.exports = connectDB;
