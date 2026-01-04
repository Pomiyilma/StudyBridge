const express = require("express");
const router = express.Router();
const Book = require("../models/books"); // <-- points to your model

// POST /books/add
router.post("/add", async (req, res) => {
  const { title, toc } = req.body;

  if (!title || !toc) {
    return res.status(400).json({ error: "Title and TOC are required" });
  }

  try {
    const newBook = new Book({ title, toc });
    await newBook.save();
    res.json({ message: "Book TOC added successfully", book: newBook });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to add book" });
  }
});

module.exports = router;
