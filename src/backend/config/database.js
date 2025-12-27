const mongoose = require('mongoose');

// /c:/Users/Eyob Fikre/.vscode/Github Repos/StudyBridge/src/backend/config/database.js
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studybridge';

async function connect() {
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    return mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => mongoose.connection);
}

async function disconnect() {
    if (mongoose.connection.readyState === 0) return;
    return mongoose.disconnect();
}

module.exports = { connect, disconnect, mongoose };