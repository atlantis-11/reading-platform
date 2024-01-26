const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
});

const Book = mongoose.model('Book', schema);

module.exports = Book;