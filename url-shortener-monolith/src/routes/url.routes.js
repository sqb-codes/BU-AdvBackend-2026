// Only Routing.. No logic

const express = require("express");
const router = express.Router();
const controller = require('../controllers/url.controller');

// Create Short URL
router.post("/shorten", controller.shortenUrl);

// Redirect
router.get("/:code", controller.redirectUrl);

module.exports = router;