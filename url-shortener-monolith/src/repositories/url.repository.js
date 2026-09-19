// Repository - DAO - Data Access Only
const Url = require("../models/url.model");

exports.create = async (originalUrl) => {
    console.log("Creating URL in DB...",originalUrl);
    const doc = await Url.create( {originalUrl} );
    console.log("URL created in DB...");
    return doc._id;
}

exports.updatedCode = async(id, code) => {
    console.log("Updating short code");
    return Url.findByIdAndUpdate(id, {shortCode : code});
}

exports.findByCode = async(code) => {
    return Url.findOne({shortCode : code});
};

