// src/routes/profile.js
const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// GET /api/profile - fetch user profile
router.get("/", auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-passwordHash" // exclude password
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/profile - update profile
router.put("/", auth(), async (req, res) => {
  try {
    const { name, email, grade, avatar, bio, password } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only update allowed fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (grade) user.grade = grade;
    if (avatar) user.avatar = avatar;
    if (bio) user.bio = bio;
    if (password) user.passwordHash = await bcrypt.hash(password, 10);

    await user.save();

    // Return updated user without password
    const { passwordHash, ...userData } = user.toObject();
    res.json(userData);
  } catch (err) {
    console.error("Failed to update profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
