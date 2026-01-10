const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  toc: {
    type: String,
    required: true,
  },
  relationships: [
    {
      topicA: String,
      topicB: String,
      descriptionA: String,
      descriptionB: String,
      relationship: String,
      resources: [String],
    },
  ],
});

module.exports = mongoose.model("Analysis", analysisSchema);
