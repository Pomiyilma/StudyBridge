const express = require("express");
const { OpenAI } = require("openai");

module.exports = (dbConnection) => {
  const router = express.Router();

  // Tie model to the specific DB connection
  const Book = dbConnection.model("Book", require("../models/books").schema);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  router.get("/", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q)
        return res.status(400).json({ msg: "Please enter a search term" });

      // DATABASE SEARCH
      const searchRegex = new RegExp(q, "i");
      const books = await Book.find({
        "toc.topics": { $elemMatch: { $regex: searchRegex } },
      });

      let results = [];
      let crossSubjectSet = new Set();

      books.forEach((book) => {
        book.toc.forEach((unit) => {
          const matchedTopics = unit.topics.filter((topic) =>
            searchRegex.test(topic)
          );

          if (matchedTopics.length > 0) {
            unit.topics.forEach((t) => {
              if (!matchedTopics.includes(t))
                crossSubjectSet.add(`${t} (${book.subject})`);
            });

            results.push({
              subject: book.subject,
              grade: book.grade,
              unit: unit.unit,
              matchedTopics: matchedTopics,
              relatedConcepts: unit.topics
                .filter((t) => !matchedTopics.includes(t))
                .slice(0, 3),
            });
          }
        });
      });

      // AI INTEGRATION
      let aiBrief = "";
      let recommendations = [];
      const textbookContext = results
        .map((r) => `${r.subject} Gr ${r.grade}`)
        .join(", ");

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an expert tutor for the Ethiopian National Curriculum. Your response MUST be valid JSON.",
            },
            {
              role: "user",
              content: `Topic: "${q}". Curriculum context: ${
                textbookContext || "General Science"
              }. JSON format: { "description": "...", "bridgeNote": "...", "links": [{"title": "...", "url": "..."}] }`,
            },
          ],
          response_format: { type: "json_object" },
        });

        const aiData = JSON.parse(completion.choices[0].message.content);
        aiBrief = aiData.description + " " + aiData.bridgeNote;
        recommendations = aiData.links;
      } catch (aiErr) {
        console.error("AI Error:", aiErr.message);
        aiBrief = `Search results for "${q}" found in ${results.length} curriculum units.`;
        recommendations = [
          {
            title: "Watch on YouTube",
            url: `https://www.youtube.com/results?search_query=Ethiopian+Curriculum+${q}`,
          },
        ];
      }

      res.json({
        query: q,
        count: results.length,
        aiBrief,
        recommendations,
        crossSubjectSuggestions: Array.from(crossSubjectSet).slice(0, 6),
        results: results.sort((a, b) =>
          a.grade.localeCompare(b.grade, undefined, { numeric: true })
        ),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server Error" });
    }
  });

  return router;
};
