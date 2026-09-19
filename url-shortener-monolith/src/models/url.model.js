// models - Schema

const mongoose = require("mongoose");
const UrlSchema = new mongoose.Schema({
    originalUrl: {type: String, required: true},
    shortCode: {type: String, unique: true, sparse: true},
    createdAt : {type : Date, default: Date.now},
    clickCount: {type: Number, default: 0}
});

module.exports = mongoose.model("Url", UrlSchema);
