const mongoose = require('mongoose');
const bookSchema = require('./schemas/bookSchema');

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;