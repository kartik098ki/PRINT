require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db-adapter.cjs');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// DEBUG LOGGER
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// Serve Static Frontend (Vite Build)
const path = require('path');
// Go up one level to root, then dist (assuming build runs in root)
const distPath = path.join(__dirname, '..', 'dist');
const fs = require('fs');

if (process.env.NODE_ENV === 'production') {
    if (fs.existsSync(path.join(distPath, 'index.html'))) {
        console.log("✅ Static Assets Found at:", distPath);
    } else {
        console.error("❌ CRTICAL: Static Assets MISSING at:", distPath);
        console.error("   Did you run 'npm run build'?");
    }
}

app.use(express.static(distPath));

// --- ROUTES ---

// 0. HEALTH CHECK
app.get('/api/health', (req, res) => {
    // Helper to check what DB we are using
    const isProd = !!process.env.DATABASE_URL;
    res.json({
        status: 'ok',
        time: new Date().toISOString(),
        dbType: isProd ? 'POSTGRES (Neon)' : 'SQLITE (Temporary/Local)',
        warning: isProd ? null : "Data will be lost on restart. Set DATABASE_URL to fix."
    });
});

// 1. REGISTER USER
app.post('/api/register', async (req, res) => {
    console.log('[POST] /api/register', req.body);
    const { name, email, password, role } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const id = 'user_' + Buffer.from(normalizedEmail).toString('base64').substring(0, 10);

    const sql = `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`;
    try {
        await db.query(sql, [id, name, normalizedEmail, password, role || 'user']);
        console.log('User registered:', normalizedEmail);
        res.json({ id, name, email: normalizedEmail, role: role || 'user' });
    } catch (err) {
        console.error('Register Error:', err.message);
        return res.status(400).json({ error: 'Email already exists' });
    }
});

// 2. LOGIN USER
app.post('/api/login', async (req, res) => {
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
    try {
        const result = await db.query(sql, [email.toLowerCase().trim(), password]);
        const row = result.rows[0];

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
    } catch (err) {
        console.error('Login DB Error:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// 2.5. GET ALL USERS (Admin/Debug)
app.get('/api/users', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Get Users Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 3. GET ORDERS (For Vendor Dashboard & User History)
app.get('/api/orders', async (req, res) => {
    const { userId } = req.query; // Optional filter

    let sql = `SELECT * FROM orders ORDER BY created_at DESC`;
    let params = [];

    if (userId) {
        sql = `SELECT * FROM orders WHERE userId = ? ORDER BY created_at DESC`;
        params = [userId];
    }

    try {
        const result = await db.query(sql, params);
        const rows = result.rows;

        // Parse JSON fields
        const orders = rows.map(o => ({
            ...o,
            files: typeof o.files === 'string' ? JSON.parse(o.files || '[]') : o.files,
            settings: typeof o.settings === 'string' ? JSON.parse(o.settings || '{}') : o.settings
        }));
        res.json(orders);
    } catch (err) {
        console.error('Get Orders Error:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// 4. CREATE ORDER
app.post('/api/orders', async (req, res) => {
    console.log('[POST] /api/orders', req.body);
    const { userId, userEmail, files, settings, totalAmount } = req.body;

    if (!files || totalAmount === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = Date.now().toString();

    // Unique OTP Generation
    let otp;
    let isUnique = false;
    let attempts = 0;

    try {
        while (!isUnique && attempts < 5) {
            otp = Math.floor(1000 + Math.random() * 9000).toString();
            const checkSql = `SELECT id FROM orders WHERE otp = ? AND status != 'collected'`;
            const result = await db.query(checkSql, [otp]);
            if (result.rows.length === 0) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) throw new Error("Could not generate unique OTP");

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

        await db.query(sql, params);
        console.log('Order created successfully:', id);
        res.json({
            id, userId, userEmail, files, settings, totalAmount, status: 'paid', otp, created_at: new Date().toISOString()
        });

    } catch (err) {
        console.error('Order Insert Error:', err.message);
        return res.status(500).json({ error: err.message });
    }
});

// 5. UPDATE ORDER STATUS (Vendor Actions)
// Note: Changed from /api/orders/:id/status to /api/orders/:id to match old backend if necessary.
// But wait, the frontend is calling /api/orders/:id/status.
// I should Support BOTH or keep the new path style.
// The old backend expected PATCH /api/orders/:id
// My new OrderContext calls PATCH /api/orders/:id/status
// I MUST update this route to match the NEW frontend code, otherwise it will break.
app.patch('/api/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    const sql = `UPDATE orders SET status = ? WHERE id = ?`;
    try {
        await db.query(sql, [status, id]);
        res.json({ success: true, id, status });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Catch-All Route
app.get('*', (req, res) => {
    console.log('Catch-all hit for:', req.url);
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (v2.0 - Postgres Ready)`);
});
