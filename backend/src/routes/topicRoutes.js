const express = require('express');
const { check, validationResult } = require('express-validator');
const Topic = require('../models/Topic');

const router = express.Router();

// Adjust path to your Topic model as needed

// GET /topics - list all topics
router.get('/', async (req, res) => {
    try {
        const topics = await Topic.find().sort({ createdAt: -1 });
        res.json(topics);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /topics/:id - get a single topic
router.get('/:id', async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });
        res.json(topic);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /topics - create a new topic
router.post(
    '/',
    [
        check('title').trim().notEmpty().withMessage('Title is required'),
        check('description').optional().trim(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

        try {
            const { title, description } = req.body;
            const topic = new Topic({ title, description });
            await topic.save();
            res.status(201).json(topic);
        } catch (err) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// PUT /topics/:id - update a topic
router.put(
    '/:id',
    [
        check('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
        check('description').optional().trim(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

        try {
            const updates = {};
            if (req.body.title !== undefined) updates.title = req.body.title;
            if (req.body.description !== undefined) updates.description = req.body.description;

            const topic = await Topic.findByIdAndUpdate(req.params.id, updates, { new: true });
            if (!topic) return res.status(404).json({ message: 'Topic not found' });
            res.json(topic);
        } catch (err) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// DELETE /topics/:id - remove a topic
router.delete('/:id', async (req, res) => {
    try {
        const topic = await Topic.findByIdAndDelete(req.params.id);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });
        res.json({ message: 'Topic deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;