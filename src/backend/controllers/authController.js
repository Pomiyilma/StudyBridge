import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const {validationMiddleware} = require('../middlewares/validationMiddleware');

const db = admin.firestore();
const register  = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.collection('users').doc(email).add({
            email,
            password: hashedPassword,
            role
        });
        res.status(201).json({success: true, message: 'User registered successfully' });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (userSnapshot.empty) throw new Error('User not found');
        const user = userSnapshot.docs[0].data();
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid credentials');
        const token = jwt.sign({ id: userSnapshot.docs[0].id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    register,
    login
};