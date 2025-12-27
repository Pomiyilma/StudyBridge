// topicServices.js

const topics = [];

// Create a new topic
const createTopic = (title, description) => {
    const newTopic = { id: topics.length + 1, title, description };
    topics.push(newTopic);
    return newTopic;
};

// Get all topics
const getAllTopics = () => {
    return topics;
};

// Get a topic by ID
const getTopicById = (id) => {
    return topics.find(topic => topic.id === id);
};

// Update a topic
const updateTopic = (id, updatedData) => {
    const topicIndex = topics.findIndex(topic => topic.id === id);
    if (topicIndex !== -1) {
        topics[topicIndex] = { ...topics[topicIndex], ...updatedData };
        return topics[topicIndex];
    }
    return null;
};

// Delete a topic
const deleteTopic = (id) => {
    const topicIndex = topics.findIndex(topic => topic.id === id);
    if (topicIndex !== -1) {
        return topics.splice(topicIndex, 1);
    }
    return null;
};

module.exports = {
    createTopic,
    getAllTopics,
    getTopicById,
    updateTopic,
    deleteTopic
};