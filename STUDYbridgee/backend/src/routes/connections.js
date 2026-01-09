// src/routes/connections.js
const express = require("express");
const auth = require("../middleware/auth");
const Connection = require("../models/Connection");
const router = express.Router();

router.get("/", async (req, res) => {
  const { subject, fromTopicId } = req.query;
  const filter = { approved: true };
  if (fromTopicId) filter.fromTopicId = fromTopicId;
  if (subject) filter.subjectContext = subject;
  const result = await Connection.find(filter)
    .populate("fromTopicId", "title")
    .populate("toTopicId", "title subjects tags");
  res.json(result);
});

router.delete("/:id", auth(["admin"]), async (req, res) => {
  await Connection.findByIdAndDelete(req.params.id);
  res.json({ deleted: true });
});

module.exports = router;
