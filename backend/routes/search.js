const express = require('express');
const router = express.Router();
const Book = require('../models/books');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ msg: "Please enter a search term" });

    // 1. DATABASE SEARCH (Searching all 16 books)
    const searchRegex = new RegExp(q, 'i');
    const books = await Book.find({
      "toc.topics": { $elemMatch: { $regex: searchRegex } }
    });

    let results = [];
    let crossSubjectSet = new Set(); // To store topics from other subjects

    books.forEach(book => {
      book.toc.forEach(unit => {
        const matchedTopics = unit.topics.filter(topic => searchRegex.test(topic));
        
        if (matchedTopics.length > 0) {
          // Collect "Cross-Subject" related concepts
          unit.topics.forEach(t => {
            if (!matchedTopics.includes(t)) {
              // Add subject name to help the student see the connection
              crossSubjectSet.add(`${t} (${book.subject})`);
            }
          });

          results.push({
            subject: book.subject,
            grade: book.grade,
            unit: unit.unit,
            matchedTopics: matchedTopics,
            // Only show top 3 local related topics per card
            relatedConcepts: unit.topics.filter(t => !matchedTopics.includes(t)).slice(0, 3)
          });
        }
      });
    });

    // 2. AI DEFINITION & RECOMMENDATIONS
    let aiBrief = "";
    let recommendations = [];
    
    // Prepare context for the AI so it knows what the textbooks say
    const textbookContext = results.map(r => `${r.subject} Gr ${r.grade}`).join(", ");

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // High speed, low cost
        messages: [
          { 
            role: "system", 
            content: "You are an expert tutor for the Ethiopian National Curriculum. You provide scientific definitions and resource links. Your response MUST be valid JSON." 
          },
          { 
            role: "user", 
            content: `Topic: "${q}". 
            This topic appears in the following curriculum books: ${textbookContext || 'General Science'}.
            1. Define "${q}" in 2 sentences for a high schooler.
            2. Explain why it is important across different subjects.
            3. Provide 2 YouTube search links and 1 edu link.
            
            JSON format: 
            {
              "description": "...",
              "bridgeNote": "...",
              "links": [{"title": "...", "url": "..."}]
            }` 
          }
        ],
        response_format: { type: "json_object" }
      });

      const aiData = JSON.parse(completion.choices[0].message.content);
      aiBrief = aiData.description + " " + aiData.bridgeNote;
      recommendations = aiData.links;
    } catch (aiErr) {
      console.error("AI Error:", aiErr.message);
      aiBrief = `Search results for "${q}" found in ${results.length} curriculum units.`;
      recommendations = [{ title: "Watch on YouTube", url: `https://www.youtube.com/results?search_query=Ethiopian+Curriculum+${q}` }];
    }

    // 3. RETURN INTEGRATED DATA
    res.json({
      query: q,
      count: results.length,
      aiBrief: aiBrief,
      recommendations: recommendations,
      // Suggesting topics from the cross-subject set
      crossSubjectSuggestions: Array.from(crossSubjectSet).slice(0, 6),
      results: results.sort((a, b) => a.grade.localeCompare(b.grade, undefined, {numeric: true}))
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;