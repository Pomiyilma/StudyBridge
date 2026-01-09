const Topic = require("../models/Topic");
const Connection = require("../models/Connection");

const MAX_CONNECTIONS = 3;

function score(a, b) {
  let s = 0;
  if (a.subject === b.subject) s += 2;
  if (a.grade === b.grade) s += 1;
  if (a.subject !== b.subject) s += 1; // diversity bonus
  return s;
}

module.exports = async function autoConnect() {
  console.log("🔗 Auto-connect started");

  const topics = await Topic.find();

  for (const topic of topics) {
    // Count existing outgoing connections
    const existing = await Connection.countDocuments({
      fromTopicId: topic._id,
    });

    if (existing >= MAX_CONNECTIONS) continue;

    if (!topic.tags || topic.tags.length === 0) continue;

    // Find candidates by shared concept tags
    const candidates = await Topic.find({
      _id: { $ne: topic._id },
      tags: { $in: topic.tags },
    });

    // Score & sort
    const ranked = candidates
      .map((t) => ({ topic: t, score: score(topic, t) }))
      .sort((a, b) => b.score - a.score);

    let created = 0;

    for (const { topic: target } of ranked) {
      if (created >= MAX_CONNECTIONS) break;

      try {
        await Connection.create({
          fromTopicId: topic._id,
          toTopicId: target._id,
          reason: "concept-match",
          createdBy: "rule",
        });
        created++;
        console.log(`✔ ${topic.title} → ${target.title}`);
      } catch (err) {
        // Duplicate → skip
      }
    }
  }

  console.log("✅ Auto-connect completed");
};
