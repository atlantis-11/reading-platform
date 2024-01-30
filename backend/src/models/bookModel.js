const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    olid: {
        type: String,
        required: [true, 'olid (Open Library Id) is required'],
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    authors: {
        type: [String],
        validate: {
            validator: v => Array.isArray(v) && v.length > 0,
            message: 'At least 1 author is required'
        }
    },
    numberOfPages: {
        type: Number,
        required: true,
        min: [1, 'Number of pages must be at least 1'],
        max: [10000, 'Number of pages cannot exceed 10000'],
        default: 1
    },
    description: String,
    publishers: [String],
    publishDate: String
});

const Book = mongoose.model('Book', schema);

module.exports = Book;