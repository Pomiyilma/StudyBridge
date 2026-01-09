// routes/books.js
const express = require("express");

module.exports = (dbConnection) => {
  const router = express.Router();

  // Define your Book model tied to this connection
  const Book = require("../models/books")(dbConnection);

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
      console.error("BOOK ADD ERROR:", err);
      res.status(500).json({ error: "Failed to add book" });
    }
  });

  return router;
};
