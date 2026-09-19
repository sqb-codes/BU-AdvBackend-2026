const app = require("./src/app");
const connectDB = require("./src/config/db");
const PORT = process.env.PORT || 4000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server Started at PORT : ${PORT}`);
})