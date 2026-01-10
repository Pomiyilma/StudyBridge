// routes/profileRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/auth');
const profileControllerFactory = require('../controllers/profileController');

/**
 * Function to create profile routes
 * @param {any} dbConnection - DB connection
 * @returns express.Router
 */
const profileRoutes = (dbConnection) => {
    const router = express.Router();

    // Initialize User model with the connection
    const User = require('../models/User')(dbConnection);

    // Initialize controller with User model
    const profileController = profileControllerFactory(User);

    // GET /api/profile - fetch logged-in user's profile
    router.get('/', authMiddleware(), profileController.getUserProfile);

    // PUT /api/profile - update logged-in user's profile
    router.put('/', authMiddleware(), profileController.updateUserProfile);

    return router;
};

module.exports = profileRoutes;
