// Responsibilities:
// 1. Receive HTTP inputs
// 2. Call service
// 3. Return response

const urlService = require("../services/url.service");

// PORT /shorten
exports.shortenUrl = async (req, res, next) => {
    try {
        const result = await 
        urlService.createShortUrl(req.body.originalUrl);
        res.json(result);
    } catch (error) {
        next(error);
    }
}


// GET /:code
exports.redirectUrl = async(req, res, next) => {
    try {
        const original = await
        urlService.getOriginalUrl(req.params.code);
    } catch (error) {
        next(error)
    }
}