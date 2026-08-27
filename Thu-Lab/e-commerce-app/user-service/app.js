const express = require("express");
const dotenv = require("dotenv");
dotenv.config()

const app = express();

app.get("/", (req, res) => {
    res.send("<h1>Hello world using Docker...!!!</h2>");
});

const PORT = process.env.PORT || 4646;

app.listen(PORT, () => {
    console.log(`Server started at PORT : ${PORT}`);
})