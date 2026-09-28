const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            maxlength: 128,
            validate: {
                validator: (password) => Buffer.byteLength(password, "utf8") <= 72,
                message: "password must be at most 72 bytes",
            },
            select: false,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_document, result) {
                delete result.password;
                delete result.__v;
                return result;
            },
        },
    },
);

userSchema.pre("save", async function hashPassword() {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
