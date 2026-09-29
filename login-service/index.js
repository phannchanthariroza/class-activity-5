const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./db');
const User = require('./models/User');
require('dotenv').config();

const app = express();
app.use(express.json());
connectDB();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

app.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !['admin', 'user'].includes(role)) {
            return res.status(400).json({ error: 'email, password and role (admin or user) are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ error: 'Invalid Email or Password!' });

        if (user.role !== role) return res.status(400).json({ error: 'Invalid role specified for this account!' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid Email or Password!' });

        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5002, () => console.log('Login Service running on port 5002'));