const app = require("./src/app");
const connectMongoDB = require("./src/config/db");
const { connectRedis } = require("./src/config/redis");
const PORT = process.env.PORT || 4000;

// Async wrapper
// DB + Redis must be ready before server starts..
// IIFE - Immediately Invoked Function Expression
(async () => {
    await connectMongoDB();
    await connectRedis();
    app.listen(PORT, () => {
    console.log(`Server Started at PORT : ${PORT}`);
    });
})();