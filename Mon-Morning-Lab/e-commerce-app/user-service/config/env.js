const DEFAULT_PORT = 3000;

function getConfig() {
    const port = Number(process.env.PORT || DEFAULT_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("PORT must be a valid TCP port");
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || Buffer.byteLength(jwtSecret) < 32) {
        throw new Error("JWT_SECRET must be set to at least 32 bytes");
    }

    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";
    if (!/^\d+(s|m|h|d|w|y)$/.test(jwtExpiresIn)) {
        throw new Error("JWT_EXPIRES_IN must be a duration such as 15m, 1h, or 7d");
    }

    let mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
        const { MONGODB_DATABASE: database, MONGODB_USERNAME: username, MONGODB_PASSWORD: password } = process.env;
        if (!database || !username || !password) {
            throw new Error("Set MONGODB_URI or MONGODB_DATABASE, MONGODB_USERNAME, and MONGODB_PASSWORD");
        }

        const host = process.env.MONGODB_HOST || "mongo";
        mongodbUri = `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:27017/${encodeURIComponent(database)}?authSource=admin`;
    }

    const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
    const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (Boolean(bootstrapEmail) !== Boolean(bootstrapPassword)) {
        throw new Error("Set both BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD to create an initial admin");
    }

    return {
        port,
        mongodbUri,
        jwtSecret,
        jwtExpiresIn,
        bootstrapAdmin: bootstrapEmail
            ? {
                email: bootstrapEmail.trim().toLowerCase(),
                password: bootstrapPassword,
                name: process.env.BOOTSTRAP_ADMIN_NAME || "Administrator",
            }
            : null,
    };
}

module.exports = { getConfig };
