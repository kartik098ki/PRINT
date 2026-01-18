const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

// Check if specific database URL is provided (Validation for Production)
const isProduction = !!process.env.DATABASE_URL;

let db;
let dbType = isProduction ? 'POSTGRES' : 'SQLITE';

if (isProduction) {
    console.log('🔌 Connecting to PostgreSQL (Render/Neon)...');
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    console.log('📂 Connecting to SQLite (Local)...');
    const dbPath = path.resolve(__dirname, 'jprint_data.db');
    const sqliteDb = new sqlite3.Database(dbPath);

    // Wrap SQLite to match Generic Interface
    db = {
        query: (text, params) => {
            return new Promise((resolve, reject) => {
                // Determine if it's a SELECT (all) or INSERT/UPDATE (run)
                // This is a naive heuristic but works for this app's simple queries
                const method = text.trim().toUpperCase().startsWith('SELECT') ? 'all' : 'run';

                sqliteDb[method](text, params || [], function (err, rows) {
                    if (err) return reject(err);
                    // Standardize result to match PG
                    resolve({
                        rows: method === 'all' ? rows : [],
                        rowCount: this.changes
                    });
                });
            });
        },
        serialize: (cb) => sqliteDb.serialize(cb)
    };
}

// Initialize Tables
const initDB = async () => {
    // We need slightly different SQL for PG vs SQLite for table creation if types differ,
    // but generic TEXT/REAL/DATETIME mostly works or can be aliased.

    // PostgreSQL uses TIMESTAMPTZ, SQLite uses DATETIME
    // We will use standard compatible syntax where possible.

    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE,
            role TEXT,
            password TEXT, 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const ordersTable = `
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            userId TEXT,
            userEmail TEXT,
            files TEXT, 
            settings TEXT,
            totalAmount REAL,
            status TEXT,
            otp TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await db.query(usersTable);
        await db.query(ordersTable);
        console.log(`✅ Tables created/verified in ${dbType}`);
    } catch (err) {
        console.error('❌ Database Initialization Error:', err);
    }
};

// Initialize immediately
initDB();

module.exports = {
    query: async (text, params) => {
        // Convert ? query params to $1, $2, etc for Postgres
        if (dbType === 'POSTGRES') {
            let i = 1;
            while (text.includes('?')) {
                text = text.replace('?', '$' + i);
                i++;
            }
        }
        return db.query(text, params);
    },
    // Expose raw db object if really needed (try to avoid)
    _raw: db
};
