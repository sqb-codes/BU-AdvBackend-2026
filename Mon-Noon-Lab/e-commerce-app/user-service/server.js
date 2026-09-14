const express = require("express");
const dotenv = require("dotenv");
dotenv.config()

const app = express();

app.get("/", (req, res) => {
    res.send("<h1>Welcome to Express with Docker...!!!</h1>");
})

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`Server Started at PORT: ${PORT}`);
})