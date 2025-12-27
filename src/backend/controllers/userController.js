const User = require('../../models/User');
const Topic = require('../../models/Topic');

/**
 * User controller for topic-related operations.
 * Exports handlers: listUsers, getUser, createUser, updateUser, deleteUser,
 * addTopicToUser, removeTopicFromUser, getUserTopics
 */

const listUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').lean();
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to list users', details: err.message });
    }
};

const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password').lean();
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to get user', details: err.message });
    }
};

const createUser = async (req, res) => {
    try {
        const payload = req.body;
        const existing = await User.findOne({ email: payload.email });
        if (existing) return res.status(409).json({ error: 'Email already in use' });
        const user = await User.create(payload);
        const safe = user.toObject();
        delete safe.password;
        return res.status(201).json(safe);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to create user', details: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = { ...req.body };
        delete payload.password; // protect password update here (handle separately if needed)
        const user = await User.findByIdAndUpdate(id, payload, { new: true }).select('-password').lean();
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to update user', details: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id).lean();
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json({ message: 'User deleted' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to delete user', details: err.message });
    }
};

const addTopicToUser = async (req, res) => {
    try {
        const { id } = req.params; // user id
        const { topicId } = req.body;
        if (!topicId) return res.status(400).json({ error: 'topicId is required' });

        const [user, topic] = await Promise.all([
            User.findById(id),
            Topic.findById(topicId)
        ]);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!topic) return res.status(404).json({ error: 'Topic not found' });

        if (!user.topics) user.topics = [];
        if (user.topics.includes(topicId)) return res.status(409).json({ error: 'Topic already assigned' });

        user.topics.push(topicId);
        await user.save();
        return res.status(200).json({ message: 'Topic added to user' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to add topic', details: err.message });
    }
};

const removeTopicFromUser = async (req, res) => {
    try {
        const { id, topicId } = req.params; // /users/:id/topics/:topicId
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!user.topics || !user.topics.includes(topicId)) {
            return res.status(404).json({ error: 'Topic not assigned to user' });
        }

        user.topics = user.topics.filter(t => t.toString() !== topicId);
        await user.save();
        return res.status(200).json({ message: 'Topic removed from user' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to remove topic', details: err.message });
    }
};

const getUserTopics = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).populate('topics').select('topics').lean();
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json(user.topics || []);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to get user topics', details: err.message });
    }
};

module.exports = {
    listUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    addTopicToUser,
    removeTopicFromUser,
    getUserTopics
};