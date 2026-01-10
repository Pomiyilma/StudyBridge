const express = requires("express");
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../backend/controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Register route
router.post("/register", registerUser);
// Login route
router.post("/login", loginUser);
// Logout route
router.post("/logout", authMiddleware, logoutUser);

module.exports = router;
