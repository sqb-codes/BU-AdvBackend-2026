const express = require("express");
const { getCurrentUser, login, register } = require("../controllers/auth.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getCurrentUser);

module.exports = router;
