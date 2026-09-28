const express = require("express");
const { createUser, deleteUser, getUser, listUsers, updateUser } = require("../controllers/user.controller");
const { authenticateToken, authorizeRoles, authorizeSelfOrAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticateToken);
router.route("/")
    .post(authorizeRoles("admin"), createUser)
    .get(authorizeRoles("admin"), listUsers);
router.route("/:id")
    .get(authorizeSelfOrAdmin, getUser)
    .patch(authorizeSelfOrAdmin, updateUser)
    .delete(authorizeRoles("admin"), deleteUser);

module.exports = router;
