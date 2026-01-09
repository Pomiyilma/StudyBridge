// src/routes/profile.js
const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const User = require("../models/User");
const router = express.Router();

router.put("/", auth(), async (req, res) => {
  const { email, password, interests, gradeLevel } = req.body;
  const user = await User.findById(req.user.userId);
  if (email) user.email = email;
  if (password) user.passwordHash = await bcrypt.hash(password, 10);
  if (interests) user.interests = interests;
  if (gradeLevel) user.gradeLevel = gradeLevel;
  await user.save();
  res.json({ user });
});

module.exports = router;
