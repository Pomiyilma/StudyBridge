// src/routes/progress.js
const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const router = express.Router();

router.post("/tick", auth(), async (req, res) => {
  const user = await User.findById(req.user.userId);
  const today = new Date().toDateString();
  const last = user.lastActiveDate
    ? new Date(user.lastActiveDate).toDateString()
    : null;

  if (last === today) {
    return res.json({
      streakCount: user.streakCount,
      message: "Already active today",
    });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = last === yesterday.toDateString();

  user.streakCount = isYesterday ? user.streakCount + 1 : 1;
  user.lastActiveDate = new Date();
  await user.save();
  res.json({ streakCount: user.streakCount });
});

module.exports = router;
