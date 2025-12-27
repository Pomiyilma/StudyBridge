// src/backend/middleware/errorMiddleWare.js
function errorHandler(err, req, res, next) {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Resource not found with id: ${err.value}`;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(e => e.message).join(', ');
    }

    // Mongo duplicate key
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {}).join(', ');
        message = `Duplicate field value: ${field}`;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    const payload = { success: false, message };
    if (process.env.NODE_ENV !== 'production') payload.stack = err.stack;

    res.status(statusCode).json(payload);
}

module.exports = errorHandler;