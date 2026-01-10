const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema({
  fromTopicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true,
  },
  toTopicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true,
  },
  reason: String,
  subjectContext: String,
  createdBy: String,
  approved: { type: Boolean, default: true },
});

module.exports = mongoose.model("Connection", connectionSchema);
