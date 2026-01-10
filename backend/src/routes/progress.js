// src/routes/progress.js
const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const jwt = require("jsonwebtoken");

// ==========================
// Auth middleware
// ==========================
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ msg: "Token is not valid" });
  }
};

// ==========================
// POST /progress/mastery
// Toggle mastery for a card
// ==========================
router.post("/mastery", auth, async (req, res) => {
  try {
    const { cardId } = req.body;
    if (!cardId) return res.status(400).json({ msg: "cardId is required" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.masteredIds) user.masteredIds = [];

    if (user.masteredIds.includes(cardId)) {
      // Unmark if already mastered
      user.masteredIds = user.masteredIds.filter((id) => id !== cardId);
    } else {
      // Mark as mastered
      user.masteredIds.push(cardId);
    }

    await user.save();
    res.json({ masteredIds: user.masteredIds });
  } catch (err) {
    console.error("Mastery Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ==========================
// POST /progress/streak
// Update daily streak
// ==========================
router.post("/streak", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const today = new Date().toDateString();
    const lastActive = user.lastActiveDate
      ? new Date(user.lastActiveDate).toDateString()
      : null;

    if (lastActive === today) {
      return res.json({
        streakCount: user.streakCount || 0,
        message: "Already active today",
      });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = lastActive === yesterday.toDateString();

    user.streakCount = isYesterday ? (user.streakCount || 0) + 1 : 1;
    user.lastActiveDate = new Date();

    await user.save();
    res.json({ streakCount: user.streakCount });
  } catch (err) {
    console.error("Streak Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
