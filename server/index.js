const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. REGISTER USER
app.post('/api/register', (req, res) => {
    const { name, email, password, role } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const id = 'user_' + Buffer.from(normalizedEmail).toString('base64').substring(0, 10);

    const sql = `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [id, name, normalizedEmail, password, role || 'user'], function (err) {
        if (err) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.json({ id, name, email: normalizedEmail, role: role || 'user' });
    });
});

// 2. LOGIN USER
app.post('/api/login', (req, res) => {
    const { email, password, role } = req.body;

    // Vendor Hardcoded Check (for extra security layer, though we could move to DB)
    if (role === 'vendor') {
        if (email === 'kartikguleria12@gmail.com' && password === 'kk@123') {
            return res.json({
                id: 'vendor_admin',
                name: 'Kartik Guleria',
                email: email,
                role: 'vendor'
            });
        } else {
            return res.status(401).json({ error: 'Invalid Vendor API Key' });
        }
    }

    // Normal DB Login
    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.get(sql, [email.toLowerCase().trim(), password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'Invalid credentials' });

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
    const { userId } = req.query; // Optional filter

    let sql = `SELECT * FROM orders ORDER BY created_at DESC`;
    let params = [];

    if (userId) {
        sql = `SELECT * FROM orders WHERE userId = ? ORDER BY created_at DESC`;
        params = [userId];
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Parse JSON fields
        const orders = rows.map(o => ({
            ...o,
            files: JSON.parse(o.files || '[]'),
            settings: JSON.parse(o.settings || '{}')
        }));
        res.json(orders);
    });
});

// 4. CREATE ORDER
app.post('/api/orders', (req, res) => {
    const { userId, userEmail, files, settings, totalAmount, otp } = req.body;
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
        if (err) return res.status(500).json({ error: err.message });

        // Return the full new order object
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
