const express = require("express");
const router = express.Router();
const Analysis = require("../models/Analysis");
require("dotenv").config();
router.post("/", async (req, res) => {
    const { toc } = req.body;
  
    if (!toc) return res.status(400).json({ error: "Table of Contents is required" });
  
    try {
      // -----------------------------
      // MOCK AI RESPONSE FOR TESTING
      // -----------------------------
      const aiText = JSON.stringify([
        {
          topicA: "Cell",
          topicB: "Cellular Reactions",
          descriptionA: "A cell is the basic unit of life.",
          descriptionB: "Cellular reactions are chemical processes inside cells.",
          relationship: "Cellular reactions happen inside cells.",
          resources: [
            "https://www.khanacademy.org/science/biology",
            "https://www.youtube.com/watch?v=abc123"
          ]
        },
        {
          topicA: "Enzymes",
          topicB: "Metabolism",
          descriptionA: "Enzymes are proteins that speed up chemical reactions.",
          descriptionB: "Metabolism is the set of life-sustaining chemical reactions.",
          relationship: "Enzymes catalyze metabolic reactions.",
          resources: [
            "https://www.khanacademy.org/science/biology/enzymes",
            "https://www.youtube.com/watch?v=xyz456"
          ]
        }
      ]);
  
      const relationships = JSON.parse(aiText);
  
      // Save to MongoDB
      const analysis = new Analysis({ toc, relationships });
      await analysis.save();
  
      res.json({
        message: "Analysis generated successfully (mock data)",
        data: analysis
      });
  
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Analysis failed" });
    }
  });
  

// POST /analyze - main route to analyze Table of Contents
router.post("/", async (req, res) => {
  const { toc } = req.body;

  if (!toc) {
    return res.status(400).json({ error: "Table of Contents is required" });
  }

  try {
    // 1️⃣ Prepare prompt for AI
    const prompt = `
You are an academic tutor.
Given the following Table of Contents:

${toc}

1. Identify related concepts between topics.
2. For each related pair, give:
   - Short description of each concept
   - Relationship explanation
   - 2-3 recommended trusted resources (websites or YouTube)
Use simple language for first-year students.
Return in JSON format with keys: topicA, topicB, descriptionA, descriptionB, relationship, resources.
`;

    // 2️⃣ Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const aiText = completion.choices[0].message.content;

    // 3️⃣ Try parsing AI JSON
    let relationships;
    try {
      relationships = JSON.parse(aiText);
    } catch (err) {
      // If AI returns text instead of JSON, store the raw text
      relationships = [
        {
          topicA: "Error parsing AI output",
          topicB: "",
          descriptionA: aiText,
          descriptionB: "",
          relationship: "",
          resources: []
        }
      ];
    }

    // 4️⃣ Save to MongoDB
    const analysis = new Analysis({ toc, relationships });
    await analysis.save();

    // 5️⃣ Send response
    res.json({
      message: "Analysis generated successfully",
      data: analysis
    });

  } catch (err) {
    console.error("OpenAI Error:", err.response?.data || err.message || err);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

module.exports = router;
