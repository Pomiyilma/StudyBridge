const express = require("express");
const router = express.Router();
const Topic = require("../models/Topic");
const Connection = require("../models/Connection");

// GET all topics with populated connections
router.get("/", async (req, res) => {
  try {
    const topics = await Topic.find().lean();

    const topicsWithConnections = await Promise.all(
      topics.map(async (t) => {
        const connections = await Connection.find({
          $or: [{ fromTopicId: t._id }, { toTopicId: t._id }],
          approved: true,
        })
          .populate("fromTopicId", "title description tags")
          .populate("toTopicId", "title description tags")
          .lean();

        // Only return the connected topic, not the connection itself
        const connectedTopics = connections.map((c) =>
          c.fromTopicId._id.toString() === t._id.toString()
            ? c.toTopicId
            : c.fromTopicId
        );

        return { ...t, connections: connectedTopics };
      })
    );

    res.json(topicsWithConnections);
  } catch (err) {
    console.error("❌ Error fetching topics:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Seed test topics
router.post("/seed", async (req, res) => {
  try {
    // Clear existing topics & connections
    await Connection.deleteMany();
    await Topic.deleteMany();

    const topics = await Topic.insertMany([
      { title: "Cell Biology (Grade 9)", tags: ["biology", "cell", "grade9"] },
      {
        title: "Human Biology and Health (Grade 9)",
        tags: ["biology", "health", "grade9"],
      },
      {
        title: "Chemical Bonding (Grade 9)",
        tags: ["chemistry", "bonding", "grade9"],
      },
      {
        title: "Vectors (Grade 9 Physics)",
        tags: ["physics", "vectors", "grade9"],
      },
      {
        title: "Motion in Straight Line (Grade 9 Physics)",
        tags: ["physics", "motion", "grade9"],
      },
      { title: "Algebra (Grade 9 Math)", tags: ["math", "algebra", "grade9"] },
      {
        title: "Geometry (Grade 9 Math)",
        tags: ["math", "geometry", "grade9"],
      },
      {
        title: "Statistics (Grade 9 Math)",
        tags: ["math", "statistics", "grade9"],
      },
      // Add more topics as needed...
    ]);

    res.json({ message: "Seed completed", topics });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// AUTO-CONNECT route
// AUTO-CONNECT route (Improved)
// AUTO-CONNECT route (clean version)
router.post("/auto-connect", async (req, res) => {
  try {
    const topics = await Topic.find();

    const getGrade = (title = "") => {
      const match = title.match(/grade\s*(\d+)/i);
      return match ? match[1] : null;
    };

    const createdConnections = [];

    for (const topic of topics) {
      // Skip if topic already has a connection to the same target
      const existingConnections = await Connection.find({
        $or: [{ fromTopicId: topic._id }, { toTopicId: topic._id }],
      });

      const alreadyConnectedIds = new Set();
      existingConnections.forEach((c) => {
        alreadyConnectedIds.add(c.fromTopicId.toString());
        alreadyConnectedIds.add(c.toTopicId.toString());
      });

      let target = null;
      let reason = null;
      let subjectContext = null;

      // RULE 1: Same Grade
      const grade = getGrade(topic.title);
      if (grade) {
        target = await Topic.findOne({
          _id: { $ne: topic._id, $nin: Array.from(alreadyConnectedIds) },
          title: { $regex: `grade\\s*${grade}`, $options: "i" },
        });
        if (target) {
          reason = "grade-match";
          subjectContext = `Grade ${grade}`;
        }
      }

      // RULE 2: Tag overlap
      if (!target && topic.tags?.length > 0) {
        target = await Topic.findOne({
          _id: { $ne: topic._id, $nin: Array.from(alreadyConnectedIds) },
          tags: { $in: topic.tags },
        });
        if (target) {
          reason = "tag-match";
          subjectContext = topic.tags[0];
        }
      }

      if (!target) continue;

      // Create ONE connection document for the pair
      const connection = await Connection.findOneAndUpdate(
        {
          $or: [
            { fromTopicId: topic._id, toTopicId: target._id },
            { fromTopicId: target._id, toTopicId: topic._id },
          ],
        },
        {
          $setOnInsert: {
            fromTopicId: topic._id,
            toTopicId: target._id,
            reason,
            subjectContext,
            createdBy: "rule",
            approved: true,
          },
        },
        { upsert: true, new: true }
      );

      createdConnections.push(connection);

      console.log(`🔗 ${topic.title} ↔ ${target.title} (${reason})`);
    }

    // Populate the result
    const result = await Connection.find()
      .populate("fromTopicId", "title")
      .populate("toTopicId", "title")
      .lean();

    res.json({ message: "Auto-connect completed", connections: result });
  } catch (err) {
    console.error("❌ Auto-connect failed:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET single topic with connections
router.get("/:id", async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).lean();
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    const connections = await Connection.find({
      $or: [{ fromTopicId: topic._id }, { toTopicId: topic._id }],
      approved: true,
    })
      .populate("fromTopicId", "title description tags")
      .populate("toTopicId", "title description tags")
      .lean();

    const connectedTopics = connections.map((c) =>
      c.fromTopicId._id.toString() === topic._id.toString()
        ? c.toTopicId
        : c.fromTopicId
    );

    res.json({ ...topic, connections: connectedTopics });
  } catch (err) {
    console.error("❌ Error fetching topic:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// MANUAL connect
router.post("/:sourceId/connect/:targetId", async (req, res) => {
  try {
    const { sourceId, targetId } = req.params;

    const source = await Topic.findById(sourceId);
    const target = await Topic.findById(targetId);
    if (!source || !target)
      return res.status(404).json({ message: "Topic not found" });

    for (const [from, to] of [
      [sourceId, targetId],
      [targetId, sourceId],
    ]) {
      await Connection.updateOne(
        { fromTopicId: from, toTopicId: to },
        {
          $setOnInsert: { reason: "manual", approved: true, createdBy: "user" },
        },
        { upsert: true }
      );
    }

    res.json({ message: "Connected successfully" });
  } catch (err) {
    console.error("❌ Manual connect failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/add", async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const newTopic = new Topic({
      title,
      description: description || "",
      tags: tags || [],
    });
    await newTopic.save();

    res
      .status(201)
      .json({ message: "Topic added successfully", topic: newTopic });
  } catch (err) {
    console.error("❌ Error adding topic:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// RESET ONLY CONNECTIONS (safe)
router.post("/reset-connections", async (req, res) => {
  try {
    await Topic.updateMany({}, { $set: { connections: [] } });
    res.json({ message: "All connections deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset connections" });
  }
});

module.exports = router;
