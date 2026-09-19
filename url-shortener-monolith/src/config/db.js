const mongoose = require("mongoose");

// Centralized database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected successfully...");
    } catch (error) {
        console.error("MongoDB connection failed...", error.message);
        process.exit(1);
    }
}

module.exports = connectDB;