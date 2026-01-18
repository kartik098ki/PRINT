const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite (creates file if missing)
const dbPath = path.resolve(__dirname, 'jprint_data.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create Tables
db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        role TEXT,
        password TEXT, 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Orders Table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        userId TEXT,
        userEmail TEXT,
        files TEXT, -- JSON string of files
        settings TEXT, -- JSON string of print settings
        totalAmount REAL,
        status TEXT, -- paid, printed, collected
        otp TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
    )`);

    console.log("Tables created/verified");
});

module.exports = db;
