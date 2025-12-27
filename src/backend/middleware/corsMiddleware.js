const cors = require('cors');

const corsMiddleware = (req, res, next) => {
    const allowedOrigins = ['http://example.com', 'http://anotherdomain.com']; // Add your allowed origins here
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
};

module.exports = corsMiddleware;