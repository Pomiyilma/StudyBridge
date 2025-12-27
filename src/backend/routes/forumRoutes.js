const express = require('express');

const router = express.Router();

// Simple in-memory store (replace with DB/models in production)
const forums = [];

// helpers
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function findForum(id) {
    return forums.find(f => f.id === id);
}
function findPost(postId) {
    for (const f of forums) {
        const p = f.posts.find(x => x.id === postId);
        if (p) return { post: p, forum: f };
    }
    return null;
}

// Forum routes
router.get('/forums', (req, res) => {
    res.json(forums);
});

router.post('/forums', (req, res) => {
    const { title, description } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title required' });
    const forum = { id: genId(), title, description: description || '', posts: [] };
    forums.push(forum);
    res.status(201).json(forum);
});

router.get('/forums/:forumId', (req, res) => {
    const forum = findForum(req.params.forumId);
    if (!forum) return res.status(404).json({ error: 'forum not found' });
    res.json(forum);
});

router.put('/forums/:forumId', (req, res) => {
    const forum = findForum(req.params.forumId);
    if (!forum) return res.status(404).json({ error: 'forum not found' });
    const { title, description } = req.body || {};
    if (title !== undefined) forum.title = title;
    if (description !== undefined) forum.description = description;
    res.json(forum);
});

router.delete('/forums/:forumId', (req, res) => {
    const idx = forums.findIndex(f => f.id === req.params.forumId);
    if (idx === -1) return res.status(404).json({ error: 'forum not found' });
    forums.splice(idx, 1);
    res.status(204).end();
});

// Posts
router.get('/forums/:forumId/posts', (req, res) => {
    const forum = findForum(req.params.forumId);
    if (!forum) return res.status(404).json({ error: 'forum not found' });
    res.json(forum.posts);
});

router.post('/forums/:forumId/posts', (req, res) => {
    const forum = findForum(req.params.forumId);
    if (!forum) return res.status(404).json({ error: 'forum not found' });
    const { title, content, author } = req.body || {};
    if (!title || !content) return res.status(400).json({ error: 'title and content required' });
    const post = { id: genId(), forumId: forum.id, title, content, author: author || 'anonymous', comments: [], createdAt: new Date() };
    forum.posts.push(post);
    res.status(201).json(post);
});

router.get('/posts/:postId', (req, res) => {
    const found = findPost(req.params.postId);
    if (!found) return res.status(404).json({ error: 'post not found' });
    res.json(found.post);
});

router.put('/posts/:postId', (req, res) => {
    const found = findPost(req.params.postId);
    if (!found) return res.status(404).json({ error: 'post not found' });
    const { title, content } = req.body || {};
    if (title !== undefined) found.post.title = title;
    if (content !== undefined) found.post.content = content;
    res.json(found.post);
});

router.delete('/posts/:postId', (req, res) => {
    const found = findPost(req.params.postId);
    if (!found) return res.status(404).json({ error: 'post not found' });
    const idx = found.forum.posts.findIndex(p => p.id === found.post.id);
    found.forum.posts.splice(idx, 1);
    res.status(204).end();
});

// Comments
router.get('/posts/:postId/comments', (req, res) => {
    const found = findPost(req.params.postId);
    if (!found) return res.status(404).json({ error: 'post not found' });
    res.json(found.post.comments);
});

router.post('/posts/:postId/comments', (req, res) => {
    const found = findPost(req.params.postId);
    if (!found) return res.status(404).json({ error: 'post not found' });
    const { content, author } = req.body || {};
    if (!content) return res.status(400).json({ error: 'content required' });
    const comment = { id: genId(), postId: found.post.id, content, author: author || 'anonymous', createdAt: new Date() };
    found.post.comments.push(comment);
    res.status(201).json(comment);
});

module.exports = router;