const Feedback = require('../models/Feedback'); // Adjust the path as necessary

// feedbackController.js


// Create a new feedback
exports.createFeedback = async (req, res) => {
    try {
        const feedback = new Feedback(req.body);
        await feedback.save();
        res.status(201).send(feedback);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Get all feedback
exports.getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find();
        res.status(200).send(feedbacks);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Get feedback by ID
exports.getFeedbackById = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return res.status(404).send();
        }
        res.status(200).send(feedback);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Update feedback by ID
exports.updateFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!feedback) {
            return res.status(404).send();
        }
        res.status(200).send(feedback);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Delete feedback by ID
exports.deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!feedback) {
            return res.status(404).send();
        }
        res.status(200).send(feedback);
    } catch (error) {
        res.status(500).send(error);
    }
};