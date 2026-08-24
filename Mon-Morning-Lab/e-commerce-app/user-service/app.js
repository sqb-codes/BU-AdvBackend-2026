const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.get("/", (req, res) => {
    res.send("<h1>Welcome to Express with Docker!!!");
});

const PORT = process.env.PORT || 4949;

app.listen(PORT, () => {
    console.log(`Server Starter at PORT : ${PORT}`);
})