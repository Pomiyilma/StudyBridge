const Resource = require('../models/resourceModel');

'use strict';


/**
 * Create a new resource
 * POST /resources
 */
async function createResource(req, res) {
    try {
        const payload = req.body;
        const resource = new Resource(payload);
        await resource.save();
        return res.status(201).json(resource);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

/**
 * Get list of resources with optional search, sort, pagination
 * GET /resources
 * Query: q (search), page, limit, sort (field), order (asc|desc)
 */
async function getResources(req, res) {
    try {
        const { q, page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;
        const filter = {};

        if (q) {
            const regex = new RegExp(q, 'i');
            // adjust fields to search as needed
            filter.$or = [{ title: regex }, { description: regex }];
        }

        const skip = (Math.max(parseInt(page, 10), 1) - 1) * Math.max(parseInt(limit, 10), 1);
        const sortOrder = order === 'asc' ? 1 : -1;

        const [items, total] = await Promise.all([
            Resource.find(filter).sort({ [sort]: sortOrder }).skip(skip).limit(Math.max(parseInt(limit, 10), 1)),
            Resource.countDocuments(filter)
        ]);

        return res.json({
            data: items,
            meta: {
                total,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                pages: Math.ceil(total / Math.max(parseInt(limit, 10), 1))
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

/**
 * Get a single resource by id
 * GET /resources/:id
 */
async function getResourceById(req, res) {
    try {
        const { id } = req.params;
        const resource = await Resource.findById(id);
        if (!resource) return res.status(404).json({ error: 'Resource not found' });
        return res.json(resource);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

/**
 * Update a resource by id
 * PUT /resources/:id
 */
async function updateResource(req, res) {
    try {
        const { id } = req.params;
        const payload = req.body;
        const resource = await Resource.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
        if (!resource) return res.status(404).json({ error: 'Resource not found' });
        return res.json(resource);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

/**
 * Delete a resource by id
 * DELETE /resources/:id
 */
async function deleteResource(req, res) {
    try {
        const { id } = req.params;
        const resource = await Resource.findByIdAndDelete(id);
        if (!resource) return res.status(404).json({ error: 'Resource not found' });
        return res.status(204).send();
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

module.exports = {
    createResource,
    getResources,
    getResourceById,
    updateResource,
    deleteResource
};