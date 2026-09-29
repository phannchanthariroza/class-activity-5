const express = require('express');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const User = require('./models/User');
require('dotenv').config();

const app = express();
app.use(express.json());
connectDB();

app.post('/userregister', async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ error: 'name, email, password and phone are required' });
        }
        if (role === 'admin') {
            return res.status(403).json({ error: 'Admin accounts must be created by an authorized administrator' });
        }
        
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already registered!' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email: email.toLowerCase(), password: hashedPassword, role: role || 'user', phone });
        try {
            await newUser.save();
        } catch (saveError) {
            if (saveError.code === 11000) return res.status(409).json({ error: 'Email already registered!' });
            throw saveError;
        }

        res.status(201).json({ message: 'User registered successfully!', userId: newUser._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5001, () => console.log('Register Service running on port 5001'));