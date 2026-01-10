const mongoose = require("mongoose");

const TocSchema = new mongoose.Schema({
  unit: String,
  topics: [String],
  embeddings: [[Number]], // embeddings per topic
});

const BookSchema = new mongoose.Schema({
  grade: String,
  subject: String,
  title: String,
  toc: [TocSchema],
});

module.exports = mongoose.model("Book", BookSchema);
