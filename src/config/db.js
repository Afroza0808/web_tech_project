const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = process.env.DB_PATH ||
    path.join(__dirname, '../../database/bookloop.db');

//const dbPath = path.join(__dirname, '../../database/bookloop.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to BookLoop Database!');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            price REAL NOT NULL,
            book_condition TEXT NOT NULL,
            seller_name TEXT NOT NULL,
            listing_type TEXT NOT NULL,
            status TEXT DEFAULT 'Available',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Table creation failed:', err.message);
        } else {
            console.log('Books table is ready!');
        }
    });
});

module.exports = db;
