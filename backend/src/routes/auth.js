const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

module.exports = (dbConnection) => {
  const router = express.Router();

  // Tie User model to this DB connection
  const User = require("../models/User")(dbConnection);

  // --- REGISTER ---
  router.post("/register", async (req, res) => {
    try {
      const { name, email } = req.body;
      if (!name || !email)
        return res.status(400).json({ msg: "Name and email required" });

      let user = await User.findOne({ email });
      if (user && user.isVerified)
        return res.status(400).json({ msg: "Email already registered" });

      const code = Math.floor(100000 + Math.random() * 900000);
      const expiry = Date.now() + 15 * 60 * 1000;

      if (!user) user = new User({ name, email });

      user.verificationCode = code;
      user.verificationCodeExpiry = expiry;
      user.isVerified = false;

      await user.save();

      await sendEmail(
        email,
        "StudyBridge Verification Code",
        `<h2>Your verification code</h2><h1>${code}</h1><p>Expires in 15 minutes</p>`
      );

      res.json({ msg: "Verification code sent" });
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      res.status(500).json({ msg: "Server error" });
    }
  });

  router.post("/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ msg: "Email required" });

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "User not found" });

      // generate 6-digit code as string
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

      user.resetCode = resetCode;
      user.resetCodeExpires = expiry;

      await user.save();

      // send email
      await sendEmail(
        email,
        "StudyBridge Password Reset",
        `
          <h2>Password Reset</h2>
          <p>Your reset code is:</p>
          <h1>${resetCode}</h1>
          <p>This code expires in 10 minutes.</p>
        `
      );

      res.json({ msg: "Reset code sent to email" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  });
  // --- VERIFY CODE ---
  router.post("/verify-code", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code)
        return res.status(400).json({ msg: "Email and code required" });

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "User not found" });

      if (
        user.verificationCode !== Number(code) ||
        user.verificationCodeExpiry < Date.now()
      )
        return res.status(400).json({ msg: "Invalid or expired code" });

      res.json({ msg: "Code verified", success: true });
    } catch (err) {
      console.error("VERIFY CODE ERROR:", err);
      res.status(500).json({ msg: "Server error" });
    }
  });

  // --- REGISTER COMPLETE ---
  router.post("/register-complete", async (req, res) => {
    try {
      const { email, code, password } = req.body;
      if (!email || !code || !password)
        return res
          .status(400)
          .json({ msg: "Email, code and password required" });

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "User not found" });

      if (
        user.verificationCode !== Number(code) ||
        user.verificationCodeExpiry < Date.now()
      )
        return res.status(400).json({ msg: "Invalid or expired code" });

      user.password = await bcrypt.hash(password, 10);
      user.isVerified = true;
      user.verificationCode = undefined;
      user.verificationCodeExpiry = undefined;

      await user.save();
      res.json({ msg: "Registration complete", success: true });
    } catch (err) {
      console.error("REGISTER COMPLETE ERROR:", err);
      res.status(500).json({ msg: "Server error" });
    }
  });

  // --- LOGIN ---
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ msg: "Email and password required" });

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "User not found" });
      if (!user.isVerified)
        return res.status(400).json({ msg: "Account not verified" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        token,
        user: { id: user._id, email: user.email, name: user.name },
        msg: "Login successful",
      });
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      res.status(500).json({ msg: "Server error" });
    }
  });
  // ===============================
  // RESET PASSWORD
  // ===============================
  router.post("/reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword)
        return res.status(400).json({ msg: "All fields are required" });

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "User not found" });

      // validate code
      if (user.resetCode !== code)
        return res.status(400).json({ msg: "Invalid reset code" });

      if (user.resetCodeExpires < Date.now())
        return res.status(400).json({ msg: "Reset code expired" });

      // ✅ Reset password
      user.password = await bcrypt.hash(newPassword, 10);

      // ✅ Clear reset code to prevent reuse
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;

      await user.save();

      res.json({ msg: "Password reset successful", success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  });
  // ================================
  // VERIFY RESET CODE (Forgot Password)
  // ================================
  router.post("/verify-reset-code", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code)
        return res.status(400).json({ msg: "Email and code required" });

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "User not found" });

      if (user.resetCode !== code)
        return res.status(400).json({ msg: "Invalid reset code" });

      if (user.resetCodeExpires < Date.now())
        return res.status(400).json({ msg: "Reset code expired" });

      // ✅ Important: Do NOT clear code yet, only after password reset
      res.json({ msg: "Reset code verified", success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  });

  return router;
};
