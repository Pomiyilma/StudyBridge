// src/routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    roles: ["user"],
  });
  const token = jwt.sign(
    { userId: user._id, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.json({ token, user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash || "");
  if (!ok) return res.status(400).json({ message: "Invalid credentials" });
  const token = jwt.sign(
    { userId: user._id, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.json({ token, user });
});

router.post("/guest", async (req, res) => {
  const guestEmail = `guest_${Date.now()}@studybridge.local`;
  const user = await User.create({
    name: "Guest",
    email: guestEmail,
    roles: ["guest"],
  });
  const token = jwt.sign(
    { userId: user._id, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );
  res.json({ token, user });
});
console.log("User import:", User);

module.exports = router;
