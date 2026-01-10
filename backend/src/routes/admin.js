// src/routes/admin.js
const express = require("express");
const router = express.Router();
const { autoLinkByRules } = require("../services/linkingServices");
const auth = require("../middleware/auth"); // existing middleware

router.post("/auto-link", auth(["admin"]), async (req, res) => {
  try {
    const result = await autoLinkByRules();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Auto-linking failed" });
  }
});

module.exports = router;
