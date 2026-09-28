const User = require("../models/user.model");
const ApiError = require("../utils/api-error");
const { validateUserInput } = require("../utils/user-input");

async function createUser(req, res) {
    const userInput = validateUserInput(req.body, { allowRole: true, allowIsActive: true });
    const user = await User.create(userInput);
    res.status(201).json({ success: true, data: { user } });
}

async function listUsers(req, res) {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new ApiError(400, "page must be positive and limit must be between 1 and 100", "INVALID_PAGINATION");
    }

    const [users, total] = await Promise.all([
        User.find().sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
        User.countDocuments(),
    ]);

    res.status(200).json({
        success: true,
        data: { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
}

async function getUser(req, res) {
    const user = await User.findById(req.params.id);
    if (!user) {
        throw new ApiError(404, "User not found", "USER_NOT_FOUND");
    }
    res.status(200).json({ success: true, data: { user } });
}

async function updateUser(req, res) {
    const user = await User.findById(req.params.id);
    if (!user) {
        throw new ApiError(404, "User not found", "USER_NOT_FOUND");
    }

    const update = validateUserInput(req.body, {
        allowRole: req.authUser.role === "admin",
        allowIsActive: req.authUser.role === "admin",
        partial: true,
    });
    Object.assign(user, update);
    await user.save();

    res.status(200).json({ success: true, data: { user } });
}

async function deleteUser(req, res) {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        throw new ApiError(404, "User not found", "USER_NOT_FOUND");
    }
    res.status(200).json({ success: true, data: { user } });
}

module.exports = { createUser, deleteUser, getUser, listUsers, updateUser };
