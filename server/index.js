const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 0. HEALTH CHECK
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. REGISTER USER
app.post('/api/register', (req, res) => {
    console.log('[POST] /api/register', req.body);
    const { name, email, password, role } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const id = 'user_' + Buffer.from(normalizedEmail).toString('base64').substring(0, 10);

    const sql = `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [id, name, normalizedEmail, password, role || 'user'], function (err) {
        if (err) {
            console.error('Register Error:', err.message);
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.log('User registered:', normalizedEmail);
        res.json({ id, name, email: normalizedEmail, role: role || 'user' });
    });
});

// 2. LOGIN USER
app.post('/api/login', (req, res) => {
    console.log('[POST] /api/login', req.body);
    const { email, password, role } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Vendor Hardcoded Check (Case Insensitive)
    if (role === 'vendor') {
        const normalizedEmail = email.toLowerCase().trim();
        const vendorEmail = 'kartikguleria12@gmail.com';

        if (normalizedEmail === vendorEmail && password === 'kk@123') {
            console.log('Vendor login success:', vendorEmail);
            return res.json({
                id: 'vendor_admin',
                name: 'Kartik Guleria',
                email: vendorEmail,
                role: 'vendor'
            });
        } else {
            console.warn('Vendor login failed for:', normalizedEmail);
            return res.status(401).json({ error: 'Invalid Vendor Credentials' });
        }
    }

    // Normal DB Login
    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.get(sql, [email.toLowerCase().trim(), password], (err, row) => {
        if (err) {
            console.error('Login DB Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            console.warn('Login failed: Invalid credentials for', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('User login success:', row.email);
        res.json({
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role
        });
    });
});

// 3. GET ORDERS (For Vendor Dashboard & User History)
app.get('/api/orders', (req, res) => {
    // console.log('[GET] /api/orders', req.query); // Optional verbose log
    const { userId } = req.query; // Optional filter

    let sql = `SELECT * FROM orders ORDER BY created_at DESC`;
    let params = [];

    if (userId) {
        sql = `SELECT * FROM orders WHERE userId = ? ORDER BY created_at DESC`;
        params = [userId];
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Get Orders Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        try {
            // Parse JSON fields
            const orders = rows.map(o => ({
                ...o,
                files: JSON.parse(o.files || '[]'),
                settings: JSON.parse(o.settings || '{}')
            }));
            res.json(orders);
        } catch (parseError) {
            console.error('JSON Parse Error in orders:', parseError);
            res.status(500).json({ error: 'Data corruption detected in order history' });
        }
    });
});

// 4. CREATE ORDER
app.post('/api/orders', (req, res) => {
    console.log('[POST] /api/orders', req.body);
    const { userId, userEmail, files, settings, totalAmount, otp } = req.body;

    if (!files || totalAmount === undefined) {
        console.error('Order creation failed: Missing required fields', { files, totalAmount });
        return res.status(400).json({ error: 'Missing required fields (files or totalAmount)' });
    }

    const id = Date.now().toString();

    const sql = `INSERT INTO orders (id, userId, userEmail, files, settings, totalAmount, status, otp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
        id,
        userId,
        userEmail,
        JSON.stringify(files),
        JSON.stringify(settings),
        totalAmount,
        'paid',
        otp
    ];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('Order Insert Error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        // Return the full new order object
        console.log('Order created successfully:', id);
        res.json({
            id, userId, userEmail, files, settings, totalAmount, status: 'paid', otp, created_at: new Date().toISOString()
        });
    });
});

// 5. UPDATE ORDER STATUS (Vendor Actions)
app.patch('/api/orders/:id', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    const sql = `UPDATE orders SET status = ? WHERE id = ?`;
    db.run(sql, [status, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id, status });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
