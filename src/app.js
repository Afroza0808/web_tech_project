const express = require('express');

const app = express();

app.use(express.json());

const bookRoutes = require('./routes/bookRoutes');

app.get('/', (req, res) => {
    res.send('BookLoop Backend is Running!');
});

app.use('/api/books', bookRoutes);

module.exports = app;
