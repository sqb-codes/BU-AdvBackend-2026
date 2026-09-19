// Business Logic Layer
// Why Service Layer
// Same service will be used REST
// Same service will be used by Kafka Consumer
// Same service will be used by microservices


const respository = require("../repositories/url.repository");
const base62 = require("../utils/base62");

exports.createShortUrl = async(originalUrl) => {
    if(!originalUrl) {
        throw new console.error(("Original URL is required..."));
        
    }
    const id = await respository.create(originalUrl);
    console.log("ID from original URL:",id);
    const shortCode = base62.encode(898989);
    console.log("Short code generated:",shortCode);
    await respository.updatedCode(id, shortCode);
    return {
        shortuRL : `http://localhost:3000/api/url/${shortCode}`
    }
};

exports.getOriginalUrl = async (code) => {
    const data = await respository.findByCode(code);

    if (!data) throw new Error ("URL Not Found...");
    return data.originalUrl;
}
