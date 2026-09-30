const express = require("express");
const { login, register } = require("../controller/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

module.exports = router;
