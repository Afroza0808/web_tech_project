const db = require('./src/config/db');

db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='books'",
    (err, row) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log(row ? 'Books table exists!' : 'Books table not found!');
        }

        db.close();
    }
);
