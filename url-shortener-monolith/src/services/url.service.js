// Business Logic Layer
// Why Service Layer
// Same service will be used REST
// Same service will be used by Kafka Consumer
// Same service will be used by microservices


const respository = require("../repositories/url.repository");
const base62 = require("../utils/base62");
const {client} = require("../config/redis");


exports.createShortUrl = async(originalUrl) => {
    if(!originalUrl) {
        throw new console.error(("Original URL is required..."));
        
    }
    const id = await respository.create(originalUrl);
    console.log("ID from original URL:",id);
    const shortCode = base62.encode(4564564);
    console.log("Short code generated:",shortCode);
    await respository.updatedCode(id, shortCode);
    return {
        shortuRL : `http://localhost:3000/api/url/${shortCode}`
    }
};

// Cache the original URL in Redis
// Implement CACHE-ASIDE Pattern

exports.getOriginalUrl = async (code) => {
    // 1. Check Redis first (HOT Path)
    const cachedURL = await client.get(code);
    if(cachedURL) {
        console.log("Cache hit for code:", code);
        return cachedURL;
    }
    console.log("Cache Miss...");

    // 2. If not in cache, fetch from Mongo DB
    const data = await respository.findByCode(code);

    if (!data) throw new Error ("URL Not Found...");

    // 3. Cache the result in Redis (COLD Path)
    await client.set(code, data.originalUrl);
    console.log("Cached URL in Redis for code:", code);
    
    return data.originalUrl;
}
