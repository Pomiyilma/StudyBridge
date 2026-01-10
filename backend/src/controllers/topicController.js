const Topic = require("../models/Topic");

// NEW: Get all topics
exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find().populate("createdBy", "name email");
    res.json(topics);
  } catch (err) {
    console.error("Error fetching topics:", err);
    res.status(500).json({ message: "Error fetching topics" });
  }
};

exports.searchTopics = async (req, res) => {
  try {
    const { q } = req.query;
    const topics = await Topic.find({ title: new RegExp(q, "i") });
    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: "Error searching topics" });
  }
};

exports.createTopic = async (req, res) => {
  try {
    const topic = new Topic({
      title: req.body.title,
      description: req.body.description,
      createdBy: req.user.id,
    });
    await topic.save();
    res.status(201).json(topic);
  } catch (err) {
    res.status(500).json({ message: "Error creating topic" });
  }
};

exports.generateLinks = async (req, res) => {
  try {
    // placeholder logic for generating links
    res.json({ message: "Links generated for topic " + req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Error generating links" });
  }
};

exports.getConnections = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate("connections");
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    res.json(topic.connections);
  } catch (err) {
    res.status(500).json({ message: "Error fetching connections" });
  }
};
