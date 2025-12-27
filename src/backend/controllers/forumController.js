const express = require('express');

// forumController.js

const router = express.Router();

// Sample data for forums
let forums = [];

// Get all forums
router.get('/', (req, res) => {
    res.json(forums);
});

// Create a new forum
router.post('/', (req, res) => {
    const newForum = {
        id: forums.length + 1,
        title: req.body.title,
        content: req.body.content,
        createdAt: new Date()
    };
    forums.push(newForum);
    res.status(201).json(newForum);
});

// Get a forum by ID
router.get('/:id', (req, res) => {
    const forum = forums.find(f => f.id === parseInt(req.params.id));
    if (!forum) return res.status(404).send('Forum not found');
    res.json(forum);
});

// Export the router
module.exports = router;