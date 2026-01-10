require("dotenv").config();
const mongoose = require("mongoose");
const OpenAI = require("openai");

// Correct paths
const Topic = require("../src/models/Topic");
const Connection = require("../src/models/Connection");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function main() {
  const topics = await Topic.find();

  for (const topic of topics) {
    // Skip if already has 3+ connections
    const existing = await Connection.find({
      $or: [{ fromTopicId: topic._id }, { toTopicId: topic._id }],
    });

    if (existing.length >= 3) continue;

    // Example: AI-based related topic titles
    const prompt = `
      Suggest 3 topics conceptually related to "${
        topic.title
      }" from the following list:
      ${topics.map((t) => t.title).join(", ")}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const suggestedTitles = response.choices[0].message.content
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    for (const title of suggestedTitles) {
      const target = await Topic.findOne({ title });
      if (!target) continue;

      // Avoid self-links
      if (target._id.equals(topic._id)) continue;

      // Avoid duplicate connections
      const exists = await Connection.findOne({
        $or: [
          { fromTopicId: topic._id, toTopicId: target._id },
          { fromTopicId: target._id, toTopicId: topic._id },
        ],
      });
      if (exists) continue;

      await Connection.create({
        fromTopicId: topic._id,
        toTopicId: target._id,
        reason: "ai-concept",
        approved: true,
        createdBy: "ai",
      });

      console.log(`🔗 ${topic.title} → ${target.title}`);
    }
  }

  console.log("✅ AI auto-connect completed");
  mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});
