const Topic = require('../models/Topic');

/* Authentication/Authorization middleware */

const ensureAuthenticated = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    next();
};

const authorizeRoles = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
};

const authorizeTopicOwnership = async (req, res, next) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });
        // allow owner or admin
        if (topic.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        req.topic = topic;
        next();
    } catch (err) {
        next(err);
    }
};

/* Controller actions with authorization applied */

const createTopic = async (req, res, next) => {
    try {
        // ensureAuthenticated should run before this in routes
        const data = { ...req.body, owner: req.user.id };
        const topic = await Topic.create(data);
        res.status(201).json(topic);
    } catch (err) {
        next(err);
    }
};

const getTopics = async (req, res, next) => {
    try {
        const topics = await Topic.find();
        res.json(topics);
    } catch (err) {
        next(err);
    }
};

const getTopic = async (req, res, next) => {
    try {
        const topic = await Topic.findById(req.params.id);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });
        res.json(topic);
    } catch (err) {
        next(err);
    }
};

const updateTopic = async (req, res, next) => {
    try {
        // authorizeTopicOwnership should run before this in routes (sets req.topic)
        Object.assign(req.topic, req.body);
        await req.topic.save();
        res.json(req.topic);
    } catch (err) {
        next(err);
    }
};

const deleteTopic = async (req, res, next) => {
    try {
        // authorizeTopicOwnership should run before this in routes
        await req.topic.remove();
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};

module.exports = {
    ensureAuthenticated,
    authorizeRoles,
    authorizeTopicOwnership,
    createTopic,
    getTopics,
    getTopic,
    updateTopic,
    deleteTopic
};