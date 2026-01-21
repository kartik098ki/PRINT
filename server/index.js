require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'jprint_secret_key_change_this';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database Connection
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.warn("⚠️ MONGO_URI is missing. App will crash on DB operations.");
        }
        const conn = await mongoose.connect(mongoUri || 'mongodb://127.0.0.1:27017/jprint_local');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
    }
};
connectDB();

// Serve Static Files (Frontend) - CRITICAL for Render Single Service
const path = require('path');
// Go up one level to root, then dist (assuming build runs in root)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// --- AUTH MIDDLEWARE ---
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error('Auth Error:', error.message);
            res.status(401).json({ error: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

const vendor = (req, res, next) => {
    if (req.user && req.user.role === 'vendor') {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized as vendor' });
    }
};

// --- ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ error: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Orders (Protected)
// - Vendors see ALL orders
// - Users see ONLY their orders
app.get('/api/orders', protect, async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'vendor') {
            // Vendor sees all, supports search? (Client side filter mostly, but we can return all)
            orders = await Order.find({}).sort({ createdAt: -1 });
        } else {
            // User sees own
            orders = await Order.find({ userEmail: req.user.email }).sort({ createdAt: -1 });
        }
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Order (Protected)
app.post('/api/orders', protect, async (req, res) => {
    try {
        const { files, settings, totalAmount } = req.body;

        // Generate OTP
        // Logic: Retry loop until unique
        let otp;
        let isUnique = false;
        while (!isUnique) {
            otp = Math.floor(1000 + Math.random() * 9000).toString();
            const exists = await Order.findOne({ otp, status: { $ne: 'collected' } });
            if (!exists) isUnique = true;
        }

        const order = await Order.create({
            userId: req.user._id,
            userEmail: req.user.email,
            files,
            settings,
            totalAmount,
            otp
        });

        res.status(201).json({ success: true, otp, id: order._id });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Order Status (Vendor Only)
app.patch('/api/orders/:id/status', protect, vendor, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve React App for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
