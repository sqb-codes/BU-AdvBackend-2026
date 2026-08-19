const express = require("express");
const dotenv = require("dotenv")
dotenv.config()

const app = express()

const PORT = process.env.PORT || 4545;

app.listen(PORT, () => {
    console.log(`Server Started at PORT : ${PORT}`)
})