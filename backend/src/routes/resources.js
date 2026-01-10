// src/routes/resources.js
const express = require("express");
const router = express.Router();

// Example route
router.get("/", (req, res) => {
  res.json({ message: "Resources route works!" });
});

module.exports = router;
