const express = require('express');

const router = express.Router();

// Sample route for getting resources
router.get('/resources', (req, res) => {
    res.json({ message: 'List of resources' });
});

// Sample route for creating a resource
router.post('/resources', (req, res) => {
    const newResource = req.body;
    // Logic to save the new resource
    res.status(201).json(newResource);
});

// Sample route for getting a specific resource
router.get('/resources/:id', (req, res) => {
    const resourceId = req.params.id;
    // Logic to find the resource by ID
    res.json({ message: `Resource with ID: ${resourceId}` });
});

// Sample route for updating a resource
router.put('/resources/:id', (req, res) => {
    const resourceId = req.params.id;
    const updatedResource = req.body;
    // Logic to update the resource
    res.json({ message: `Resource with ID: ${resourceId} updated`, updatedResource });
});

// Sample route for deleting a resource
router.delete('/resources/:id', (req, res) => {
    const resourceId = req.params.id;
    // Logic to delete the resource
    res.json({ message: `Resource with ID: ${resourceId} deleted` });
});

module.exports = router;