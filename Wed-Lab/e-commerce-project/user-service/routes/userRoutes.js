const express = require("express");
const {
  createUser,
  deleteCurrentUser,
  deleteUser,
  getCurrentUser,
  getUser,
  listUsers,
  updateCurrentUser,
  updateUser,
} = require("../controller/userController");
const { authenticate, authorizeRoles } = require("../middlewares/auth");

const router = express.Router();

router.use(authenticate);
router.get("/me", getCurrentUser);
router.patch("/me", updateCurrentUser);
router.delete("/me", deleteCurrentUser);

router
  .route("/")
  .post(authorizeRoles("admin"), createUser)
  .get(authorizeRoles("admin"), listUsers);

router
  .route("/:userId")
  .get(getUser)
  .patch(authorizeRoles("admin"), updateUser)
  .delete(authorizeRoles("admin"), deleteUser);

module.exports = router;
