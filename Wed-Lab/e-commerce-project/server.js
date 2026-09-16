const express = require("express");
const dotenv = require("dotenv")
dotenv.config()

const app = express();

app.get("/", (req, res) => {
    res.send("<h1>Hello, welcome to Docker...</h1>");
})

const PORT = process.env.PORT || 4545;

app.listen(PORT, () => {
    console.log(`Server Started at PORT : ${PORT}`)
})