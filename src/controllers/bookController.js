const db = require('../config/db');

// Add a new book
const addBook = (req, res) => {
    const { title, author, price, book_condition, seller_name, listing_type } = req.body;

    if (!title || !author || price === undefined || !book_condition || !seller_name || !listing_type) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ message: 'Price must be a valid non-negative number' });
    }

    db.run(
        `INSERT INTO books (title, author, price, book_condition, seller_name, listing_type)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, author, price, book_condition, seller_name, listing_type],
        function (err) {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            res.status(201).json({
                message: 'Book added successfully',
                bookId: this.lastID
            });
        }
    );
};

// Get all books
const getAllBooks = (req, res) => {
    db.all('SELECT * FROM books', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        res.status(200).json(rows);
    });
};


// Get book by ID
const getBookById = (req, res) => {
    const id = req.params.id;

    db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        if (!row) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        res.status(200).json(row);
    });
};


const updateBook = (req, res) => {
    const id = req.params.id;

    const { title, author, price, book_condition, seller_name, listing_type } = req.body;

    if (!title || !author || price === undefined || !book_condition || !seller_name || !listing_type) {
        return res.status(400).json({
            message: 'All fields are required'
        });
    }

    if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({
            message: 'Price must be a valid non-negative number'
        });
    }

    db.run(
        `UPDATE books
         SET title = ?, author = ?, price = ?, book_condition = ?,
             seller_name = ?, listing_type = ?
         WHERE id = ?`,
        [title, author, price, book_condition, seller_name, listing_type, id],
        function (err) {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    message: 'Book not found'
                });
            }

            res.status(200).json({
                message: 'Book updated successfully'
            });
        }
    );
};


const deleteBook = (req, res) => {
    const id = req.params.id;

    db.run(
        'DELETE FROM books WHERE id = ?',
        [id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    message: 'Book not found'
                });
            }

            res.status(200).json({
                message: 'Book deleted successfully'
            });
        }
    );
};

module.exports = {
    addBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook
};