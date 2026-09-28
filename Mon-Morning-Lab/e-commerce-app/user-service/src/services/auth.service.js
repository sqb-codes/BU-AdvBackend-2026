const jwt = require("jsonwebtoken");
const { getConfig } = require("../../config/env");
const User = require("../models/user.model");

function createAccessToken(user) {
    const { jwtSecret, jwtExpiresIn } = getConfig();
    return jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: jwtExpiresIn });
}

async function bootstrapAdmin() {
    const { bootstrapAdmin: admin } = getConfig();
    if (!admin) return;

    const passwordBytes = Buffer.byteLength(admin.password, "utf8");
    if (passwordBytes < 12 || passwordBytes > 72) {
        throw new Error("BOOTSTRAP_ADMIN_PASSWORD must be between 12 and 72 bytes");
    }

    const existingUser = await User.findOne({ email: admin.email });
    if (existingUser) {
        if (existingUser.role !== "admin") {
            throw new Error("The configured bootstrap admin email already belongs to a non-admin user");
        }
        return;
    }

    await User.create({ ...admin, role: "admin" });
    console.log("Bootstrap admin account is ready");
}

module.exports = { bootstrapAdmin, createAccessToken };
